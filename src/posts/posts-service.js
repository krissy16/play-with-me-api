const PostsService = {
    getAllPosts(knex){
        return knex.select('*').from('posts')
    },
    insertPost(knex, newPost){
        return knex
            .insert(newPost)
            .into('posts')
            .returning('*')
            .then(rows => {
              return rows[0]
            })
    },
    getById(knex, id) {
        return knex
          .from('posts')
          .select('*')
          .where('id', id)
          .first()
    },
    deletePost(knex, id) {
        return knex('posts')
          .where({ id })
          .delete()
    },
    updatePost(knex, id, newPost) {
        return knex('posts')
          .where({ id })
          .update(newPost)
    },
}

module.exports = PostsService