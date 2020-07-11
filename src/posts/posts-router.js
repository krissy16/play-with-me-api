const path = require('path')
const express = require('express')
const xss = require('xss')
const PostsService = require('./posts-service')

const postRouter = express.Router()
const jsonParser = express.json()

const serializePost = post => ({
    id: post.id,
    post_name: xss(post.post_name),
    post_content: xss(post.post_content)
})

postRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        PostsService.getAllPosts(knexInstance)
            .then(posts => {
                res.json(posts.map(serializePost))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { post_name, post_content } = req.body
        if(post_name === undefined){
            return res.status(400).json({
                error: { message: `Missing post name in request body` }
            })
        }
        else if(post_content === undefined){
            return res.status(400).json({
                error: { message: `Missing post content in request body` }
            })
        }
        PostsService.insertPost(
            req.app.get('db'),
            { post_name, post_content }
        )
            .then(post => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${post.id}`))
                    .json(serializePost(post))
            })
            .catch(next)
})
postRouter
    .route('/:post_id')
    .get((req, res, next) => {
        PostsService.getById(
            req.app.get('db'),
            req.params.post_id
        )
        .then(post => {
            if(!post){
                return res.status(404).json({
                    error: { message: `Post doesn't exist` }
                })
            }
            res.json(serializePost(post))
        })
        .catch(next)
    })

module.exports = postRouter