const express = require('express');
const {createPost,getAllPosts,getPost,deletePost}=require('../controllers/post-controller')
const router = express.Router();
const {authenticateRequest}=require('../middleware/auth-middleware');

//middleware->this will tell if the user is an auth or not

router.use(authenticateRequest);

router.post('/create-post',createPost);
router.get('/all-posts',getAllPosts);
router.get('/:id',getPost);
router.delete('/:id',deletePost);
module.exports=router;


