/**
 * @author Kyle Huang
 * @date 12/18/2022
 * @brief This is app.js that handles the data of node web server. It includes
 * the BlogIt REST API
 */

"use strict";

// express app
const express = require("express");
const app = express();

// other module(s)
const sqlite = require("sqlite"); // sqlite database methods
const sqlite3 = require("sqlite3"); // sqlite database connection
const dotenv = require("dotenv"); // dotenv for environmental data
const multer = require("multer"); // compatible with all post requests
const bodyParser = require("body-parser"); // handle plain text for POST request

// config
dotenv.config();
app.use(express.urlencoded({extended: true})); // parse url encoded incoming request(s)
app.use(express.json()); // parse JSON incoming request(s)
app.use(multer().none());
app.use(bodyParser.text());

// status codes and error messages
const OK = 200;
const ERR_SERV = 500;
const ERR_CLIENT = 400;
const ERR_SERV_MESG = "Something went wrong with the server";
const ERR_CLIENT_MESG = "Undefined input";

// return all blog(s)
app.get("/blogs/all", async (req, res) => {
  try {
    let searchInput = req.query.search;
    let titleQry = "SELECT id FROM blogs WHERE title LIKE '%' || ? || '%';";
    let contQry = "SELECT id FROM blogs WHERE content LIKE '%' || ? || '%'"
    let allQry = "SELECT * FROM blogs ORDER BY DATETIME(created_at) DESC";
    let db = await getDBConnection();
    let blogs;
    if (searchInput) {
      blogs = await db.all(titleQry, [searchInput]);
      blogs = blogs.concat(await db.all(contQry, [searchInput]));
    } else blogs = await db.all(allQry);
    if (blogs.length === 0 && !searchInput) {
      await db.close();
      return res.status(ERR_CLIENT).type("text").send(ERR_CLIENT_MESG);
    }
    await db.close();
    res.status(OK).json({"blogs": blogs});
  } catch (err) {
    res.status(ERR_SERV).type("text").send(ERR_SERV_MESG);
  }
});

// return blog by ID
app.get("/blogs/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let singleQry = "SELECT * FROM blogs WHERE id = ?;";
    let db = await getDBConnection();
    let blog = await db.get(singleQry, [id]);
    await db.close();
    if (!blog) res.status(ERR_CLIENT).type("text").send(ERR_CLIENT_MESG);
    else res.status(OK).json(blog);
  } catch (err) {
    res.status(ERR_SERV).type("text").send(ERR_SERV_MESG);
  }
});

// return new id after creation
app.post("/blogs/create", async (req, res) => {
  try {
    let title = req.body.title;
    let content = req.body.content;
    let date = req.body.created_at;
    if (!title || !content)
      return res.status(ERR_CLIENT).type("text").send(ERR_CLIENT_MESG);
    let db = await getDBConnection();
    let blogMeta;
    if (date) {
      let createQryDate = "INSERT INTO blogs (title, content, created_at) VALUES (?, ?, ?);";
      blogMeta = await db.run(createQryDate, [title, content, date]);
    } else {
      let createQryNoDate = "INSERT INTO blogs (title, content) VALUES (?, ?);";
      blogMeta = await db.run(createQryNoDate, [title, content]);
    }
    let result = {"id": blogMeta.lastID};
    if (!date) {
      let dateQry = "SELECT DATETIME(created_at) AS created_at FROM blogs WHERE id = ?";
      let newDate = await db.get(dateQry, [blogMeta.lastID]);
      result["created_at"] = newDate.created_at;
    }
    await db.close();
    res.status(OK).json(result);
  } catch (err) {
    res.status(ERR_SERV).type("text").send(ERR_SERV_MESG);
  }
});

// save blog
app.post("/blogs/save", async (req, res) => {
  try {
    let id = req.body.id;
    let title = req.body.title;
    let content = req.body.content;
    if (!id)
      res.status(ERR_CLIENT).type("text").send(ERR_CLIENT_MESG);
    let db = await getDBConnection();
    if (title && content) {
      let updateQry = "UPDATE blogs SET title = ?, content = ? WHERE id = ?;";
      await db.run(updateQry, [title, content, id]);
    } else if (title) {
      let updateQry = "UPDATE blogs SET title = ? WHERE id = ?;";
      await db.run(updateQry, [title, id]);
    } else if (content) {
      let updateQry = "UPDATE blogs SET content = ? WHERE id = ?;";
      await db.run(updateQry, [content, id]);
    }
    await db.close();
    res.status(OK).type("text").send("successfully saved blog");
  } catch (err) {
    res.status(ERR_SERV).type("text").send(ERR_SERV_MESG);
  }
});

// delete all blogs
app.delete("/blogs/all", async (req, res) => {
  try {
    let allQry = "DELETE FROM blogs;";
    let resetQry = "UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='blogs';";
    let db = await getDBConnection();
    await db.exec(allQry);
    await db.exec(resetQry);
    await db.close();
    res.status(OK).type("text").send("successfully deleted all blogs");
  } catch (err) {
    res.status(ERR_SERV).type("text").send(ERR_SERV_MESG);
  }
});

// delete a blog
app.delete("/blogs/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let deleteQry = "DELETE FROM blogs WHERE id = ?;";
    let db = await getDBConnection();
    await db.run(deleteQry, id);
    await db.close();
    res.status(OK).type("text").send("successfully deleted blog " + id);
  } catch (err) {
    res.status(ERR_SERV).type("text").send(ERR_SERV_MESG);
  }
});

/**
 * @brief get a database connection
 * @return connected database
 */
async function getDBConnection() {
  try {
    const db = await sqlite.open({
      filename: process.env.DATABASE_PATH || "db/blogs.db",
      driver: sqlite3.Database
    });
    return db;
  } catch (err) {
    res.status(ERR_SERV).type("text").send(ERR_SERV_MESG);
  }
}

// access static files in public folder
app.use(express.static("public", {index: "blogs.html"})); 
const PORT = process.env.PORT || 8000; // set port
app.listen(PORT); // server listening for requests