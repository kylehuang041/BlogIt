/**
 * @author Kyle Huang
 * @date 12/19/2022
 * @brief This is the index.js containing the interactivity of index.html.
 * Specifically deals with the color changer, blog functionalities, and
 * API requests
 */

"use strict";
(function() {
  window.addEventListener("load", init);

  const URL_BASE_BLOGS = "/blogs"
  const URL_ALL_BLOGS = `${URL_BASE_BLOGS}/all`;
  const URL_CREATE_BLOG = `${URL_BASE_BLOGS}/create`;
  const URL_SAVE_BLOG = `${URL_BASE_BLOGS}/save`;
  const URL_BLOGS_SEARCH_QRY = `${URL_ALL_BLOGS}?search=`;
  let prevSearchQry = "";

  /**
   * @brief Main block: initialize blogs from node web service, color changer,
   * and other blog functionalities
   */
  function init() {
    let colorChangeContainer = document.getElementById("color-change-container"); // color mode box
    let bg = document.body; // background
    let nav = document.querySelector("nav"); // navigation background
    let title = document.querySelector("nav h1"); // title
    let colorChangeCircle = document.getElementById("color-change-circle"); // color mode circle
    let createBlogBtn = document.querySelector("#create-blog-btn"); // create blog button
    let deleteBlogsBtn = document.querySelector("#clear-blogs-btn"); // delete all blogs button
    let searchBar = document.querySelector("#search-bar");
    let pageTitle = document.querySelector("#page-title");
    let searchIcon = document.querySelector(".fa-magnifying-glass");
    let blogs = document.querySelector("#blog-container").children;

    // DEFAULT SETTINGS
    searchBar.value = "";
    searchIcon.disabled = true;
    if (!localStorage.getItem("isDark")) localStorage.setItem("isDark", "true");
    for (let blog of blogs) blog.querySelector("#save-btn").disabled = true;
    checkLocalColor(bg, nav, title, colorChangeCircle, searchBar); // get color mode from local storage: dark/light

    // EVENT LISTENERS
    // delete all button: deleting all blog(s)
    deleteBlogsBtn.addEventListener("click", deleteAllBlogsRequest);

    // create button: create a blog
    createBlogBtn.addEventListener("click", createBlog);

    // switch: create toggle button on the color mode
    colorChangeContainer.onclick = () => changeColor(bg, nav, title, colorChangeCircle, searchBar);
    pageTitle.onclick = showAllBlogs; // page title: show all blogs when title is clicked
    searchBar.addEventListener("keypress", searchBlogRequest); // search bar: search blog(s)
    searchIcon.addEventListener("click", searchBlogRequest); // search icon: search blog(s)

    getBlogsRequest(); // retrieve blogs from database
  }

  /**
   * @brief Get blog(s) request that matches the search query to BlogIt REST API
   * @param ev event
   */
  async function searchBlogRequest(ev) {
    if ((ev.key === 'Enter' && ev.target.value && prevSearchQry != ev.target.value.trim())
      || (this.classList.contains("fa-magnifying-glass") && ev.target.value)) {
      let curSearchQry = ev.target.value.trim();
      prevSearchQry = curSearchQry;
      ev.target.value = curSearchQry;
      let blogContainer = document.querySelector("#blog-container");
      let error = document.querySelector("#error");
      blogContainer.classList.remove("hidden");
      error.classList.add("hidden");
      try {
        let res = await fetch(URL_BLOGS_SEARCH_QRY + curSearchQry);
        await statusCheck(res);
        res = await res.json();
        res = res.blogs ? res.blogs : res;
        filterBlogs(res);
      } catch (err) {
        handleError(err);
      }
    }
  }

  /**
   * @brief Get blog(s) request to BlogIt REST API
   */
  async function getBlogsRequest() {
    try {
      let res = await fetch(URL_ALL_BLOGS);
      await statusCheck(res);
      res = await res.json();
      res = (res.blogs) ? res.blogs : res;
      for (let i = res.length - 1; i >= 0; --i) {
        let blogElem = createBlog();
        let isDark = JSON.parse(localStorage.getItem("isDark"));
        setBlogText(blogElem, res, i);
        if (isDark) blogElem.classList.remove("blog-color-change");
        else blogElem.classList.add("blog-color-change");
      }
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * @brief Make a post request that deletes all blogs request to BlogIt REST API
   * @param {windowObject} ev event
   */
  async function deleteAllBlogsRequest(ev) {
    ev.preventDefault();
    try {
      let blogContainer = document.querySelector("#blog-container");
      let res = await fetch(URL_ALL_BLOGS, {method: "DELETE"});
      await statusCheck(res);
      blogContainer.innerHTML = "";
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * @brief Make a post request to save blog text to BlogIt REST API
   * @param data data array
   *             [title, content, date] - create
   *             [id, title, content] - save
   * @param blogElem blog element - create
   */
  async function saveBlogRequest(data, blogElem = undefined) {
    try {
      let params = new FormData();
      let path;
      if (blogElem) {
        params.append("title", data[0]);
        params.append("content", data[1]);
        if (data[2]) params.append("created_at", data[2]);
        path = URL_CREATE_BLOG;
      } else {
        params.append("id", data[0]);
        if (data[1]) params.append("title", data[1]);
        if (data[2]) params.append("content", data[2]);
        path = URL_SAVE_BLOG;
      }
      let res = await fetch(path, {method: "POST", body: params}); // post request
      await statusCheck(res);
      if (blogElem) {
        res = await res.json();
        blogElem.setAttribute("id", `blog-${res.id}`); // set new id to new blog
      }
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * @brief Post request to BlogIt REST API to delete blog by id
   * @param id ID
   */
    async function deleteBlogRequest(id) {
      try {
        let data = new FormData();
        data.append("id", id);
        let res = await fetch(`${URL_BASE_BLOGS}/${id}`, {method: "DELETE", body: data});
        await statusCheck(res);
      } catch (err) {
        handleError(err);
      }
  }

  /**
   * filter blogs
   * @param {jsonData} data data
   */
  function filterBlogs(data) {
    let blogContainer = document.querySelector("#blog-container");
    let blogs = blogContainer.children;
    let targetIDs = data.map(key => key.id);
    for (let i = 0; i < blogs.length; ++i) {
      let currBlog = blogs[i];
      let currBlogID = currBlog.getAttribute("id").replace(/(blog-)/,"");
      if (!targetIDs.includes(parseInt(currBlogID))) currBlog.classList.add("hidden");
      else currBlog.classList.remove("hidden");
    }
  }

  /**
   * @brief display all blogs
   */
  function showAllBlogs(ev) {
    ev.preventDefault();
    let blogContainer = document.querySelector("#blog-container");
    let error = document.querySelector("#error");
    let searchBar = document.querySelector("#search-bar");
    searchBar.value = "";
    blogContainer.classList.remove("hidden");
    error.classList.add("hidden");
    for (let child of blogContainer.children) child.classList.remove("hidden");
  }

  /**
   * save a blog
   */
  function saveBlog(ev) {
    ev.preventDefault();
    let blogElem = this.parentNode.parentNode.parentNode;
    let id = blogElem.getAttribute("id");
    let title = blogElem.children[0].value;
    let content = blogElem.children[1].value;
    if (!title || !content) return;
    if (!id) {
      let date = new Date(blogElem.querySelector("p").textContent)
        .toLocaleString('en-US', { hour12: false }).replace(",", "")
        .replace(/[/]+/g, "-").replace(/(\d+)-(\d+)-(\d+)/g, "$3-$1-$2");
      console.log(date);
      if (!date) return;
      saveBlogRequest([title, content, date], blogElem); // create blog
    } else {
      id = id.replace(/(blog-)/,"");
      saveBlogRequest([id, title, content]); // save blog
    }
  }

  /**
   * @brief delete a blog
   * @param {windowObject} ev event
   */
  function deleteBlog(ev) {
    ev.preventDefault();
    let blogElem = this.parentNode.parentNode.parentNode;
    blogElem.remove();
    let id = blogElem.getAttribute("id");
    if (id) {
      id = id.replace(/(blog-)/, "");
      deleteBlogRequest(id);
    }
  }

  /**
   * @brief Create a blog
   */
  function createBlog() {
    let blogElem = setBlogComponents(); // create blog
    let saveBtn = blogElem.children[2].children[1].children[0];
    let dateElem = blogElem.children[2].children[0];
    let deleteBtn = saveBtn.parentNode.children[1];
    let title = blogElem.children[0];
    let content = blogElem.children[1];

    saveBtn.disabled = true;

    // if the local color mode is not dark, then set this blog to be for light mode
    if (!JSON.parse(localStorage.getItem("isDark"))) blogElem.classList.add("blog-color-change");

    setBlogConfig(blogElem); // set blog configurations
    setDateInfo(dateElem); // set date text
    title.addEventListener("input", textInputBehavior);
    content.addEventListener("input", textInputBehavior);
    saveBtn.addEventListener("click", saveBlog); // button: create/save blog
    deleteBtn.addEventListener("click", deleteBlog); // button: delete a blog
    return blogElem;
  }

  /**
   * enables search icon or blog input save button
   */
  function textInputBehavior(ev) {
    ev.preventDefault();
    let searchIcon = this.parentNode.children[0];
    let saveIcon = this.parentNode.children[2].children[1].children[0];
    if (searchIcon.getAttribute("id") === "search-icon") searchIcon.disabled = false;
    else if (saveIcon.getAttribute("id") === "save-btn") saveIcon.disabled = false;
  }

  /**
   * @brief create blog elements
   * @return blog element
   */
  function setBlogComponents() {
    // create blog elements
    let blogContainer = document.querySelector("#blog-container");
    let blogElem = document.createElement("section");
    let titleElem = document.createElement("input");
    let contentElem = document.createElement("textarea");
    let subContainer = document.createElement("div");
    let date = document.createElement("p");
    let btnContainer = document.createElement("div");
    let saveBtn = document.createElement("button");
    let deleteBtn = document.createElement("button");
    let garbageIcon = document.createElement("i");
    let saveIcon = document.createElement("i");

    // attach blog elements
    blogElem.appendChild(titleElem);
    blogElem.appendChild(contentElem);
    subContainer.appendChild(date);
    saveBtn.appendChild(saveIcon);
    btnContainer.appendChild(saveBtn);
    deleteBtn.appendChild(garbageIcon);
    btnContainer.appendChild(deleteBtn);
    subContainer.appendChild(btnContainer);
    blogElem.appendChild(subContainer);
    blogContainer.prepend(blogElem);
    return blogElem;
  }

  /**
   * set blog attributes
   * @param {DOMElement} blogElem blog
   */
  function setBlogConfig(blogElem) {
    let title = blogElem.children[0];
    let content = blogElem.children[1];
    let subContainer = blogElem.children[2];
    let btnContainer = subContainer.children[1];
    let saveBtn = btnContainer.children[0];
    let deleteBtn = btnContainer.children[1];
    let garbageIcon = deleteBtn.children[0];
    let saveIcon = saveBtn.children[0];

    // set blog attribute
    blogElem.className = "blogs";

    // set blog title attributes
    title.classList.add("text-inputs");
    title.classList.add("title");
    title.setAttribute("type", "text");
    title.setAttribute("name", "title");
    title.setAttribute("placeholder", "Enter Title");

    // set blog content attributes
    content.classList.add("text-inputs");
    content.classList.add("content");
    content.setAttribute("rows", "3");
    content.setAttribute("name", "content");
    content.setAttribute("placeholder", "Enter Content");
    content.style.resize = "none";

    // set blog div styling
    subContainer.classList.add("blog-div-1");
    btnContainer.classList.add("blog-div-2");

    // set save blog button attributes
    saveBtn.classList.add("blog-btn");
    saveBtn.setAttribute("id", "save-btn");
    saveIcon.classList.add("fa-solid", "fa-floppy-disk");
    saveIcon.setAttribute("title", "Save");

    // set delete blog button attributes
    deleteBtn.classList.add("blog-btn");
    deleteBtn.setAttribute("id", "delete-btn");
    garbageIcon.classList.add("fa-solid", "fa-trash");
    garbageIcon.setAttribute("title", "Delete");
  }

  /**
   * set blog text from data
   * @param {DOMElement} blogElem blog
   * @param {jsonData} data data
   * @param {number} idx index
   */
  function setBlogText(blogElem, data, idx) {
    let title = blogElem.children[0];
    let content = blogElem.children[1];
    let subContainer = blogElem.children[2];
    let date = subContainer.children[0];

    blogElem.setAttribute("id", `blog-${data[idx].id}`);
    title.value = data[idx].title;
    content.textContent = data[idx].content;
    date.textContent = data[idx].date;
    setDateInfo(date, data[idx].created_at);
  }

  /**
   * check local storage for dark/light mode
   * @param {DOMElement} bg page background
   * @param {DOMElement} nav navigation background
   * @param {DOMElement} title page title
   * @param {DOMElement} colorChangeCircle color change mode circle
   * @param {DOMElement} searchBar search bar
   */
  function checkLocalColor(bg, nav, title, colorChangeCircle, searchBar) {
    let blogs = document.querySelector("#blog-container").children;
    let isDark = JSON.parse(localStorage.getItem("isDark"));

    // If not dark, then enable light mode. Else, enable dark mode.
    if (isDark) {
      searchBar.classList.remove("search-color-change");
      searchBar.parentNode.children[0].classList.remove("search-color-change");
      colorChangeCircle.classList.remove("color-switch-circle-change");
      nav.classList.remove("nav-bg-color-change");
      title.classList.remove("title-bg-color-change");
      bg.classList.remove("body-bg-color-change");
      Array.from(blogs).forEach(blog => blog.classList.remove("blog-color-change"));
      // for (let i = 0; i < blogs.length; ++i) blogs[i].classList.remove("blog-color-change");
    } else {
      searchBar.classList.add("search-color-change");
      searchBar.parentNode.children[0].classList.add("search-color-change");
      colorChangeCircle.classList.add("color-switch-circle-change");
      nav.classList.add("nav-bg-color-change");
      title.classList.add("title-bg-color-change");
      bg.classList.add("body-bg-color-change");
      Array.from(blogs).forEach(blog => blog.classList.add("blog-color-change"));
      // for (let i = 0; i < blogs.length; ++i) blogs[i].classList.add("blog-color-change");
    }
  }

  /**
   * changes color of webpage
   * @param {DOMElement} bg page background
   * @param {DOMElement} nav navigation background
   * @param {DOMElement} title page title
   * @param {DOMElement} colorChangeCircle color change mode circle
   * @param {DOMElement} searchBar search bar
   */
  function changeColor(bg, nav, title, colorChangeCircle, searchBar) {
    let blogs = document.querySelectorAll('.blogs');
    let isDark = JSON.parse(localStorage.getItem("isDark"));
    localStorage.setItem("isDark", JSON.stringify(!isDark));

    // click color change mode to toggle dark/light mode
    bg.classList.toggle("body-bg-color-change");
    nav.classList.toggle("nav-bg-color-change");
    title.classList.toggle("title-bg-color-change");
    Array.from(blogs).forEach(blog => blog.classList.toggle("blog-color-change"));
    // for (let i = 0; i < blogs.length; ++i) blogs[i].classList.toggle("blog-color-change");
    colorChangeCircle.classList.toggle("color-switch-circle-change");
    searchBar.classList.toggle("search-color-change");
    searchBar.parentNode.children[0].classList.toggle("search-color-change");
  }

  /**
   * set dateTime in date element
   * @param {DOMElement} date date element
   * @param {jsonData} dataDate date from data
   */
  function setDateInfo(date, dataDate = undefined) {
    let dateObj = dataDate ? new Date(dataDate) : new Date();
    date.textContent = dateObj.toLocaleString();
  }

  /**
   * checks if there was a response
   * @param {response} res response
   * @return {data} json or text
   */
  async function statusCheck(res) {
    if (!res.ok) throw new Error(await res.text());
    return res;
  }

  /**
   * catches error from requests and prints it out on the page
   * @param {errorText} err error message
   */
  function handleError(err) {
    let blogContainer = document.querySelector("#blog-container");
    let errorTxt = document.querySelector("#error");
    blogContainer.classList.add("hidden");
    errorTxt.classList.remove("hidden");
    errorTxt.textContent = err;
  }
})();