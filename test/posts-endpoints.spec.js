const knex = require('knex')
const fixtures = require('./posts.fixtures')
const app = require('../src/app')
const supertest = require('supertest')
const { expect } = require('chai')

describe('Posts Endpoints', () => {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE posts, comments RESTART IDENTITY CASCADE'))

    afterEach('cleanup',() => db.raw('TRUNCATE posts, comments RESTART IDENTITY CASCADE'))

    describe('Unauthorized requests', () => {
        const testPosts = fixtures.makePostsArray()

        before('insert post', () => {
            return db.into('posts')
                .insert(testPosts)
        })

        it(`responds with 401 Unauthorized for GET /api/posts`, () => {
            return supertest(app)
                .get('/api/posts')
                .expect(401, { error: 'Unauthorized request' })
        })

        it(`responds with 401 Unauthorized for POST /api/posts`, () => {
            return supertest(app)
                .get('/api/posts')
                .send({ post_name: 'Test', post_content: 'test content' })
        })

        it(`responds with 401 Unauthorized for GET /api/posts/:post_id`, () => {
            const thirdPost = testPosts[2]
            return supertest(app)
                .get(`/api/posts/${thirdPost.id}`)
                .expect(401, { error: 'Unauthorized request' })
        })
    })

    describe('GET /api/posts', () => {
        const testPosts = fixtures.makePostsArray()

        beforeEach('insert posts', () => {
            return db   
                .into('posts')
                .insert(testPosts)
        })

        it('gets the posts from the store', () => {
            return supertest(app)
                .get('/api/posts')
                .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                .expect(200, testPosts)
        })
    })

    describe('GET /api/posts/:post_id', () => {
        const testPosts = fixtures.makePostsArray()

        beforeEach('insert posts', () => {
            return db   
                .into('posts')
                .insert(testPosts)
        })

        it('reponds with 200 and the specified post', () => {
            const postId = 2
            const expectedPost = testPosts[postId-1]
            return supertest(app)
                .get(`/api/posts/${postId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, expectedPost)
        })
    })

    describe('POST /api/posts', () => {
        it('responds with 400 missing post_name if not supplied', () => {
            const newPostMissingName = {
                //post_name: 'test',
                post_content: 'test content'
            }
            return supertest(app)
                .post('/api/posts')
                .send(newPostMissingName)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, {
                    error: { message: `Missing post name in request body` }
                })
        })

        it('responds with 400 missing post_content if not supplied', () => {
            const newPostMissingContent = {
                post_name: 'test'
                //post_content: 'test content'
            }
            return supertest(app)
                .post('/api/posts')
                .send(newPostMissingContent)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, {
                    error: { message: `Missing post content in request body` }
                })
        })

        it('adds a new post to the store', () => {
            const newPost = {
                post_name: 'Test title',
                post_content: 'test content'
            }
            return supertest(app)
                .post('/api/posts')
                .send(newPost)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(201)
                .expect(res => {
                    expect(res.body.post_name).to.eql(newPost.post_name)
                    expect(res.body.post_content).to.eql(newPost.post_content)
                })
                .then(res =>
                    supertest(app)
                        .get(`/api/posts/${res.body.id}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(res.body)                
                )
        })
    })
})