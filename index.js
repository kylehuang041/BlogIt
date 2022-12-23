/*
 * Name: Kyle Huang
 * Date: 10/12/2022
 *
 * This is the index.js containing the interactivity of index.html.
 * Specifically deals with the color changer, blog functionalities, and
 * local storage.
 */

"use strict";
(function() {
  window.addEventListener("load", init);

  /**
   * initialize blogs from local storage, color changer, and other
   * blog functionalities
   */
  function init() {
    let colorChangeContainer = document.getElementById("color-change-container"); // color mode box
    let bg = document.body; // background
    let navBg = document.querySelector('nav'); // navigation background
    let title = document.querySelector('nav h1'); // title
    let colorChangeCircle = document.getElementById("color-change-circle"); // color mode circle
    let createBlogBtn = document.querySelector('#create-blog-btn'); // create blog button
    let deleteBlogsBtn = document.querySelector('#blog-clear'); // delete all blogs button

    // restore blogs from local storage
    getLocalBlogsWrapper();

    // retrieve color mode from local storage: dark/light
    checkLocalColor(bg, navBg, title, colorChangeCircle);

    // create color mode switch with toggle
    colorModeWrapper(colorChangeContainer, bg, navBg, title, colorChangeCircle);

    // create a blog
    createBlogBtn.addEventListener("click", function() {
      createBlogWrapper();
    });

    // button: deleting all blog(s)
    deleteBlogsBtn.addEventListener("click", deleteAll);
  }

  /**
   * check local storage for dark/light mode
   * @param {object} bg page background
   * @param {object} navBg navigation background
   * @param {object} title page title
   * @param {object} colorChangeCircle color change mode circle
   */
  function checkLocalColor(bg, navBg, title, colorChangeCircle) {
    let blogs = document.querySelectorAll('.blogs'); // blogs
    // If not dark, then enable light mode. Else, enable dark mode.
    if (!(JSON.parse(localStorage.getItem("isDark")))) {
      colorChangeCircle.style.left = "17px";
      navBg.classList.add("nav-bg-color-change");
      title.classList.add("title-bg-color-change");
      bg.classList.add("body-bg-color-change");
      blogs.forEach(blog => blog.classList.add("blog-color-change"));
    } else {
      colorChangeCircle.style.left = "0px";
      navBg.classList.remove("nav-bg-color-change");
      title.classList.remove("title-bg-color-change");
      bg.classList.remove("body-bg-color-change");
      blogs.forEach(blog => blog.classList.remove("blog-color-change"));
    }
  }

  /**
   * changes color of webpage
   * @param {object} bg page background
   * @param {object} navBg navigation background
   * @param {object} title page title
   * @param {object} colorChangeCircle color change mode circle
   */
  function changeColor(bg, navBg, title, colorChangeCircle) {
    let blogs = document.querySelectorAll('.blogs'); // blogs
    // click color change mode to toggle dark/light mode
    bg.classList.toggle("body-bg-color-change");
    navBg.classList.toggle("nav-bg-color-change");
    title.classList.toggle("title-bg-color-change");
    blogs.forEach(blog => blog.classList.toggle("blog-color-change"));
    if (!(JSON.parse(localStorage.getItem("isDark")))) {
      colorChangeCircle.style.left = "0px";
    } else {
      colorChangeCircle.style.left = "17px";
    }
    localStorage.setItem("isDark", JSON.parse(!(JSON.parse(localStorage.getItem("isDark")))));
  }

  /**
   * create color mode switch with toggle (wrapper)
   * @param {object} colorChangeContainer color mode box
   * @param {object} bg background
   * @param {object} navBg navigation background
   * @param {object} title title
   * @param {object} colorChangeCircle color mode circle
   */
  function colorModeWrapper(colorChangeContainer, bg, navBg, title, colorChangeCircle) {
    // create toggle button on the color mode
    colorChangeContainer.onclick = () => {
      changeColor(bg, navBg, title, colorChangeCircle);
    };
  }

  /**
   * Create a blog section
   * @param {string} title blog title
   * @param {string} content blog content
   * @param {string} dateTime date and time
   * @param {integer} id blog id
   */
  let createBlog = (title = "Enter Title", content = "Enter Content", dateTime, id) => {
    const saveWaitTime = 500; // wait time to save title and content of each blog
    let main = document.querySelector("main");
    let newBlog = document.createElement("section");
    let newTitle = document.createElement("input");
    let newContent = document.createElement("textarea");
    let subContainer = document.createElement("div");
    let deleteBtn = document.createElement("button");
    let garbageIcon = document.createElement("i");
    let date = document.createElement("p");
    let count = parseInt(localStorage.getItem("count")) || 1;

    // attach subelements into blog element
    appendBlog(main, newBlog, subContainer, deleteBtn, date, newTitle, newContent);

    // set blog configurations
    setBlogConfig(newBlog, garbageIcon, subContainer, deleteBtn, id, count);

    // check local storage if count exists for blog id
    if (localStorage.getItem("count") === null) {
      localStorage.setItem("count", 1);
    }

    // set the title, content, and dateTime in blog(s)
    setBlogText(newTitle, newContent, date, title, content, dateTime, id, count);

    // if the local color mode is not dark, then set this blog to be for light mode
    if (!JSON.parse(localStorage.getItem("isDark"))) {
      newBlog.classList.add("blog-color-change");
    }

    // delete a specific blog
    deleteBlog(deleteBtn, newBlog);

    // save title and content of a specific blog after <wait> time
    saveText(newBlog, newTitle, "title", saveWaitTime);
    saveText(newBlog, newContent, "content", saveWaitTime);

    // add blog to local storage if it is not stored
    if (!id) {
      saveLocalBlog(newBlog);
    }
  };

  /**
   * create a blog (wrapper)
   * @param {string} title blog title
   * @param {string} content blog content
   * @param {string} dateTime date and time
   * @param {string} id blog id
   */
  function createBlogWrapper(title = "Enter Title", content = "Enter Content",
  dateTime, id) {
    createBlog(title, content, dateTime, id);
  }

  /**
   * retrieve data from local storage to create blog(s)
   */
  let getLocalBlogs = () => {
    let localBlogs = JSON.parse(window.localStorage.getItem("blogs"));
    if (!localBlogs) {
      return;
    }
    for (let blog in localBlogs) {
      createBlogWrapper(localBlogs[blog].title, localBlogs[blog].content,
      localBlogs[blog].dateTime, localBlogs[blog].id);
    }
  };

  /**
   * get blogs from local storage (wrapper)
   */
  function getLocalBlogsWrapper() {
    getLocalBlogs();
  }

  /**
   * set the blog text
   * @param {object} titleElem blog title element
   * @param {object} contentElem blog content element
   * @param {object} dateElem date content element
   * @param {string} title blog title
   * @param {string} content blog content
   * @param {string} dateTime date and time
   * @param {integer} id blog id
   * @param {integer} count blog count
   */
  function setBlogText(titleElem, contentElem, dateElem, title, content, dateTime, id, count) {
    // write text content if it exists. Otherwise, use placeholder
    if (id) {
      // Title: if it has not been written, set placeholder. Otherwise, set the existing title
      if (!title) {
        titleElem.setAttribute("placeholder", `Enter Title [${id}]`);
      } else {
        titleElem.value = title;
      }

      // Content: if it has not been written, set placeholder. Otherwise, set the existing content
      if (!content) {
        contentElem.setAttribute("placeholder", "Enter Content");
      } else {
        contentElem.textContent = content;
      }

      dateElem.textContent = dateTime;
    } else {
      titleElem.setAttribute("placeholder", `${title} [${id ? id : count}]`);
      contentElem.setAttribute("placeholder", `${content}`);
      dateElem.textContent = new Date().toLocaleString();
    }
  }
//newBlog, garbageIcon, deleteBtn, subContainer, id, count
  /**
   * set blog configurations
   * @param {object} newBlog blog
   * @param {object} garbageIcon garbage button icon
   * @param {object} subContainer sub container that contains date info and delete button
   * @param {object} deleteBtn delete button
   * @param {integer} id blog id
   * @param {integer} count blog count
   */
  function setBlogConfig(newBlog, garbageIcon, subContainer, deleteBtn, id, count) {
    // set config for blog
    newBlog.className = "blogs";
    newBlog.setAttribute("id", `${(id) ? "blog-" + id : "blog-" + count}`);

    // set blog title config
    newBlog.firstChild.setAttribute("type", "text");
    newBlog.childNodes[0].classList.add("text-inputs");
    newBlog.childNodes[0].contentEditable = "true";

    // set blog content config
    newBlog.childNodes[1].setAttribute("rows", "3");
    newBlog.childNodes[1].style.resize = "none";
    newBlog.childNodes[1].classList.add("text-inputs");
    newBlog.childNodes[1].contentEditable = "true";

    newBlog.appendChild(subContainer);
    subContainer.classList.add("extra");

    // set delete blog button config
    deleteBtn.className = "delete-btn";
    garbageIcon.classList.add("fa-solid", "fa-trash");
    garbageIcon.setAttribute("title", "Edit");
    deleteBtn.appendChild(garbageIcon);
  }

  /**
   * Append text, content, and delete button into blog element,
   * then append the blog into main
   * @param {object} main main element
   * @param {object} blog blog element
   * @param {object} objs objects
   */
  function appendBlog(main, blog, subContainer, date, deleteBtn, ...objs) {
    subContainer.appendChild(deleteBtn);
    subContainer.appendChild(date);
    objs.forEach(object => blog.appendChild(object)); // add title and content into new blog
    main.prepend(blog); // add new blog into main
  }

  /**
   * delete a blog
   * @param {object} deleteBtn delete button on a blog
   * @param {object} newBlog new blog
   */
  function deleteBlog(deleteBtn, newBlog) {
    deleteBtn.onclick = () => {
      let localBlogs = JSON.parse(localStorage.getItem("blogs")) || {};
      delete localBlogs[`${newBlog.id}`];
      localStorage.setItem("blogs", JSON.stringify(localBlogs));
      newBlog.remove();
    };
  }

  /**
   * After <wait> second of focus and any key press, then the blog data will be
   * saved into local storage. The blog-<id> as the key and title, content, and
   * date info as the value.
   * @param {object} blogElem blog element
   * @param {object} textElem title/content element
   * @param {string} textType title/content
   * @param {integer} wait wait time
   */
  function saveText(blogElem, textElem, textType, wait) {
    textElem.addEventListener("focus", function() {
      this.addEventListener("keydown", (event) => {
        setTimeout(() => {
          let localBlogs = JSON.parse(localStorage.getItem("blogs")) || {};
          if (localBlogs[blogElem.id]) {
            if (event.target.value !== localStorage.getItem("blogs")[`${textType}`]) {
              localBlogs[blogElem.id][textType] = event.target.value;
              localStorage.setItem("blogs", JSON.stringify(localBlogs));
            }
          }
        }, wait);
      });
    });
  }

  /**
   * stores each blog data into local storage
   * @param {object} blogObj blog object
   */
  function saveLocalBlog(blogObj) {
    if (blogObj.hasChildNodes()) {
      let date = blogObj.querySelector(".extra p");
      let children = blogObj.childNodes;
      let localBlogs = JSON.parse(localStorage.getItem("blogs")) || {};
      let tempBlog = {
        id: `${parseInt(localStorage.getItem("count"))}`,
        title: `${children[0].textContent}`,
        content: `${children[1].textContent}`,
        dateTime: date.textContent
      };
      localBlogs[blogObj.id] = tempBlog;
      localStorage.setItem("blogs", JSON.stringify(localBlogs));
      localStorage.setItem("count", parseInt(localStorage.getItem("count")) + 1);
    }
  }

  /**
   * delete all blogs and clears local storage data
   */
  function deleteAll() {
    localStorage.removeItem("count");
    localStorage.removeItem("blogs");
    let main = document.querySelector("main");
    main.innerHTML = "";
  }
})();