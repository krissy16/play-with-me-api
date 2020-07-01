const CommentsService = {
    getAllComments(knex){
        return knex.select('*').from('comments')
    },
    insertComment(knex, newComment){
        return knex
            .insert(newComment)
            .into('comments')
            .returning('*')
            .then(rows => {
              return rows[0]
            })
    },
    getByPostId(knex, post_id) {
        return knex
          .from('comments')
          .select('*')
          .where('post_id', post_id)
    },
    deleteComment(knex, id) {
        return knex('comments')
          .where({ id })
          .delete()
    },
    updateComment(knex, id, newComment) {
        return knex('Comments')
          .where({ id })
          .update(newComment)
    },
}

module.exports = CommentsService