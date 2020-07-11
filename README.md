# Play With Me API
Play With Me API is the backend support for the Play With Me app. It securely connects to the database

## Technologies Used
- Node.js
- PostgreSQL
- Javascript
- Express

## Documentation
All requests require an API key and the content-type of application/json. 
- Base URL: https://play-with-me-api.herokuapp.com
    - GET All Posts: /api/posts
    - GET Post By Id: /api/posts/:postId
    - GET All Comments Route: /api/comments
    - GET Comments By Post Id: /api/comments/:postId
    - POST a post: /api/posts
    - POST a comment: /api/comments
- Example POST request to Posts
    {
        "post_name": "example post name",
        "post_content": "example content"
    }
- Example POST request to Comments
    {
        "content": "example content",
        "post_id": 2
    }
- Example Posts Response to GET request
    [
        {
            id: 1,
            post_name: "example post name",
            post_content: "example content"
        },
        {
            id: 2,
            post_name: "example post name 2",
            post_content: "example content 2"
        }
    ]
- Example Comments Response to GET request
     [
        {
            id: 1,
            content: "example content",
            post_id: 2
        },
        {
            id: 2,
            content: "example content 2",
            post_id: 1
        }
    ]
