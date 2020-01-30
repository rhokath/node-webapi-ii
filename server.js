const express = require('express');
const server = express();
server.use(express.json());

const Posts = require('./data/db');

//sanity check
server.get('/', (req, res)=>{
    res.status(200).json({api: '...it is working'});
})

// post request
server.post('/api/posts', (req, res)=> {
    const { title, contents} = req.body;
    if(!title || !contents){
        res.status(400).json({
            errorMessage: "Please provide title and contents for the post."
        });
    } else{
        Posts.insert(req.body)
            .then(post => {
                res.status(201).json(post);
            })
            .catch(()=> {
                res.status(500).json({
                    error: "There was an error while saving the post to the database"
                });
            })
    }
})
//post for specific comment
server.post('/api/posts/:id/comments', (req, res) => {
    if (req.body.text) {
        Posts.findById(req.params.id)
            .then(post => {
                if (post.length) {
                    Posts.insertComment({ ...req.body, post_id: req.params.id })
                        .then(comment => {
                            res.status(201).json(comment);
                        })
                        .catch(error => {
                            res.status(500).json({ error: error, message: 'The posts information could not be retrieved.' });
                        });
                } else {
                    res.status(404).json({ message: 'The post with the specified ID does not exist.' });
                }
            })
            .catch(() => {
                res.status(500).json({ message: 'The posts information could not be retrieved.' });
            });
    } else {
        res.status(400).json({ errorMessage: 'Please provide text for the comment.' });
    }
});
// get
server.get('/api/posts', (req, res)=> {
    Posts.find()
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(()=> {
            res.status(500).json({
                error: "The posts information could not be retreived."
            })
        })
})
// get post with specified id
server.get('/api/posts/:id',  (req, res)=> {
    Posts.findById(req.params.id)
        .then(post => {
            if(post){
                res.status(200).json(post);
            } else{
                res.status(404).json({
                    message: "The post with the specified ID does not exist."
                })
            }

        })
        .catch(()=> {
            res.status(500).json({
                error: "The post with the information could not be retrieved."
            })
        })
})
//get to posts comments
server.get('/api/posts/:id/comments', (req, res)=> {
    Posts.findCommentById(req.params.id)
        .then(comment => {
            if(comment){
                res.status(200).json(comment);
            } else {
                res.status(404).json({
                    message: "The post with the specified ID does not exists."
                })
            }
        })
        .catch(()=>{
            res.status(500).json({
                error: "The comments information could not be retrieved."
            })
        })
})
//delete request 
server.delete('/api/posts/:id', (req, res)=> {
    Posts.remove(req.params.id)
    .then(post => {
        if(post){
            res.status(200).json({
                message: "The post was deleted."
            })
        } else {
            res.status(404).json({
                message: "The post with the specified ID does not exist."
            })
        }
    })
    .catch(()=> {
        res.status(500).json({
            error: "The post could not be removed."
        })
    })
})
//put request
server.put('/api/posts/:id', (req, res)=> {
    const { title, contents} = req.body;
    if(!title || ! contents){
        res.status(400).json({
            errorMessage: "Please provide title and contents for the post."
        })
    } else {
        Posts.update(req.params.id, req.body)
        .then(post => {
            if(post){
                res.status(200).json(req.body)
            } else {
                res.status(404).json({
                    message: "The post withthe specified ID does not exist."
                })
            }
        })
        .catch(()=>{
            res.status(500).json({
                error: "the post information could not be modified."

            })
        })
    }
})

module.exports = server;