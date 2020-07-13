function makeCommentsArray(){
    return[
        {
            id: 1,
            content: 'sample text',
            post_id: 1
        },
        {
            id: 2,
            content: 'second comment test',
            post_id: 2
        },
        {
            id: 3,
            content: 'third comment test',
            post_id: 2
        }
    ]
}

module.exports = { makeCommentsArray };