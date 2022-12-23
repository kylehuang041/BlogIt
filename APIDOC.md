# BlogIt API Documentation

Each blog is encapsulated by id, title, content, created_at.

## *Get All Blogs*

**Request Format:** /blogs/all

**Query Parameters:** search

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** Get an array of objects each containing the id, title, content, and created_at. If query parameter search exists, then filter the blogs by title from search value. Otherwise, get all blog objects.

**Example Request 1:** /blogs/all

**Example Response 1 (no query parameter):**

```
{
  "blogs": [
    {
      "id": 10,
      "title": "bob the builder",
      "content": "he's a cool guy, no doubt",
      "created_at": "2020-10-21 12:48:54"
    },
    {
      "id": 9,
      "title": "Joe mama",
      "content": "JOE MAMA GOTTEM!",
      "created_at": "2020-09-20 22:37:54"
    }
    ...
  ]
```

**Example Request:** /blogs/all?search=donkeys

**Example Response 2 (with query parameter):**

```
{
  "blogs": [
    {
      "id": 13
    },
    {
      "id": 33
    }
  ]
}
```

**Error Handling:**

* Possible 400 (invalid request) error:
  * If search query exists and database is empty.
* Possible 500 (invalid request) error:
  * If something went wrong with interacting with sqlite database on node web service.

## *Get A Blog By ID*

**Request Format:** /blogs/:id

**Request Type:** GET

**Returned Data Format:** JSON

**Description:** Get a blog object by id.

**Example Request:** /blogs/4

```
{
  "id": 4,
  "title": "bob the builder",
  "content": "he's a cool guy, no doubt",
  "created_at": "2020-10-21 12:48:54"
}
```

**Error Handling:**

* Possible 400 (invalid request) error:
  * If no match was found for blog with id
* Possible 500 (invalid request) error:
  * If something went wrong with interacting with sqlite database on node web service.

## *Create A Blog*

**Request Format:** /blogs/create

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Get the id of newly created blog by title and content and optionally the date.

**Example Request:** /blogs/create

```
{
  "id": 4,
  "date": "2022-12-19 23:38:09"
}
```

**Error Handling:**

* Possible 400 (invalid request) error:
  * If title or content is does not exist.
* Possible 500 (invalid request) error:
  * If something went wrong with interacting with sqlite database on node web service.

## *Save A Blog*

**Request Format:** /blogs/create

**Request Type:** POST

**Returned Data Format:** TEXT

**Description:** Get a success message after the blog being saved by id, title, content, or both title and content.

**Example Request:** /blogs/create

```
successfully saved blog
```

**Error Handling:**

* Possible 400 (invalid request) error:
  * If id is does not exist.
* Possible 500 (invalid request) error:
  * If something went wrong with interacting with sqlite database on node web service.

## *Delete All Blogs*

**Request Format:** */blogs/all*

**Request Type:** DELETE

**Returned Data Format:** TEXT

**Description:** get a successful delete text message

**Example Request:** */blogs/all*

**Example Response:**

```
successfully deleted all blogs
```

**Error Handling:**

* Possible 500 (invalid request) error:
  * If something went wrong with interacting with sqlite database on node web service

## *Delete A Blog*

**Request Format:** */blogs/:id*

**Request Type:** DELETE

**Returned Data Format:** TEXT

**Description:** Get a successful delete text message

**Example Request:** */blogs/4*

**Example Response:**

```
Deleted blog 4
```

**Error Handling:**

* Possible 500 (invalid request) error:
  * If something went wrong with interacting with sqlite database on node web service
