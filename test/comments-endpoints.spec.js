const knex = require('knex')
const postFixtures = require('./posts.fixtures')
const commentsFixtures = require('./comments.fixtures')
const app = require('../src/app')
const supertest = require('supertest')
const { expect } = require('chai')

describe('Comments Endpoints', () => {
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
        const testComments = commentsFixtures.makeCommentsArray()

        it(`responds with 401 Unauthorized for GET /api/comments`, () => {
            return supertest(app)
                .get('/api/comments')
                .expect(401, { error: 'Unauthorized request' })
        })

        it(`responds with 401 Unauthorized for POST /api/comments`, () => {
            return supertest(app)
                .get('/api/comments')
                .send({ post_name: 'Test', post_content: 'test content' })
        })

        it(`responds with 401 Unauthorized for GET /api/comments/:post_id`, () => {
            const thirdPost = testComments[2]
            return supertest(app)
                .get(`/api/comments/${thirdPost.id}`)
                .expect(401, { error: 'Unauthorized request' })
        })
    })

    describe('GET /api/comments', () => {
        const testComments = commentsFixtures.makeCommentsArray()
        before('reset sample post', () => 
            db.insert(postFixtures.makePostsArray()).into('posts'))

        before('insert comments', () => {
            return db  
                .insert(testComments)
                .into('comments')
        })

        it('gets the comments from the database', () => {
            return supertest(app)
                .get('/api/comments')
                .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                .expect(200, testComments)
        })
    })

    describe('POST /api/comments', () => {
        beforeEach('reset sample post', () => db.insert(postFixtures.makePostsArray()).into('posts'))

        it('responds with 400 missing content if not supplied', () => {
            const newCommentMissingContent = {
                post_id: 1
            }

            return supertest(app)  
                .post('/api/comments')
                .send(newCommentMissingContent)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, {
                    error: { message: `Missing comment content in request body` }
                })
        })

        it('responds with 400 missing post_id if not supplied', () => {
            const newCommentMissingPostId = {
                content: 'test content'
            }
            return supertest(app)  
                .post('/api/comments')
                .send(newCommentMissingPostId)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, {
                    error: { message: `Missing post id in request body` }
                })
        })
        
        it('adds a new comment to the database', () => {
            const newComment = {
                content: 'test content',
                post_id: 1
            }

            return supertest(app)
                .post('/api/comments')
                .send(newComment)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(201)
                .expect(res => {
                    expect(res.body.post_id).to.eql(newComment.post_id)
                    expect(res.body.content).to.eql(newComment.content)
                })
        })
    })

    describe('GET /api/comments/:post_id', () => {
        const testComments = commentsFixtures.makeCommentsArray()
        
        before('reset sample post', () => db.insert(postFixtures.makePostsArray()).into('posts'))

        before('insert comments', () => {
            return db   
                .into('comments')
                .insert(testComments)
        })

        it('reponds with 200 and the comments for the specified post', () => {
            const postId = 2
            const expectedComments = testComments.filter(comment => comment.post_id === postId)
            return supertest(app)
                .get(`/api/comments/${postId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, expectedComments)
        })
    })
})