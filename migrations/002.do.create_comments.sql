CREATE TABLE comments (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    content TEXT NOT NULL,
    post_id INTEGER
        REFERENCES posts(id) ON DELETE CASCADE NOT NULL
);