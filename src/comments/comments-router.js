const path = require('path')
const express = require('express')
const xss = require('xss')
const CommentsService = require('./comments-service')

const commentRouter = express.Router()
const jsonParser = express.json()

const serializeComment = comment => ({
    id: comment.id,
    content: xss(comment.content),
    post_id: comment.post_id
})

commentRouter
.route('/')
.get((req, res, next) => {
    const knexInstance = req.app.get('db')
    CommentsService.getAllComments(knexInstance)
        .then(comments => {
            res.json(comments.map(serializeComment))
        })
        .catch(next)
})
.post(jsonParser, (req, res, next) => {
    const { content, post_id } = req.body
    if(content === undefined){
        return res.status(400).json({
            error: { message: `Missing comment content in request body` }
        })
    }
    else if(post_id === undefined){
        return res.status(400).json({
            error: { message: `Missing post id in request body` }
        })
    }
    CommentsService.insertComment(
        req.app.get('db'),
        { content, post_id }
    )
        .then(comment => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${comment.id}`))
                .json(serializeComment(comment))
        })
        .catch(next)
})
commentRouter
    .route('/:post_id')
    .get((req, res, next) => {
        CommentsService.getByPostId(
            req.app.get('db'),
            req.params.post_id
        )
        .then(comments => {
            res.json(comments.map(serializeComment))
        })
        .catch(next)
    })

module.exports = commentRouter