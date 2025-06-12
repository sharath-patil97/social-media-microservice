const { error } = require('winston');
const Post = require('../models/Post');
// const { post } = require('../routes/post-routes');
const logger = require('../utils/logger');
const { validateCreatePost } = require('../utils/validation');
const { publishEvent } = require('../utils/rabbitmq');
// const {redis} =require('ioredis');

async function invalidatePostCache(req,input){

    const cachedKey = `post:${input}`
    await req.redisClient.del(cachedKey);
    const keys = await req.redisClient.keys("posts:*")
    if (keys.length>0){
        await req.redisClient.del(keys);
    }
}


const createPost = async (req,res)=>{
    logger.info('create post endpoint hit')
    try{
        // validate schema
         const {error} = validateCreatePost(req.body);
         if(error){
            logger.warn('validation error',error.details[0].message );
            return res.status(400).json({
                success : false,
                message: error.details[0].message

            });
             
        }

 
        const {content,mediaIds}=req.body;
        const newlyCretedPost = new Post({
            user:req.user.userId,
            content,
            mediaIds: mediaIds || [],
        })

        await newlyCretedPost.save();

        await publishEvent('post.created',{
            postId : newlyCretedPost._id.toString(),
            userId : newlyCretedPost.user.toString(),
            content : newlyCretedPost.content.toString(),
            createdAt : newlyCretedPost.createdAt

        });
        await invalidatePostCache(req,newlyCretedPost._id.toString());
        logger.info('post created successfully')
        return res.status(201).json({
            success: true,
            message: 'post creted succesfully'
        })


    }catch(e){
        logger.error('error creating post',error);
        res.status(500).json({
            success: false,
            message: "error creating post"
        });
    }
};


const getAllPosts = async(req,res)=>{
    try{

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) ||10;
        const startIndex = (page - 1)*limit;

        const cacheKey = `posts:${page}:${limit}`
        // const cachedPosts  = await req.redisClient.get(cacheKey);

        // if(cachedPosts){
        //     return res.json(JSON.parse(cachedPosts))
        // }

        const posts = await Post.find({}).sort({createdAt: -1}).skip(startIndex).limit(limit)

        const totalNoOfPosts = await Post.countDocuments()

        const result={
            posts,
            currentpage:page,
            totalpages:Math.ceil(totalNoOfPosts/limit),
            totalPosts:totalNoOfPosts
        }

        // save ur posts in redis cache
        await req.redisClient.setex(cacheKey,300,JSON.stringify(result));

        res.json(result)

    

    }catch(e){
        logger.error('error fetching posts',error);
        res.status(500).json({
            success: false,
            message: "error fetching posts "
        });
    };
};


const deletePost = async(req,res)=>{
    try{

        console.log('test')
        const post = await Post.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        })
        if(!post){
             return res.status(404).json({
            success: false,
            message: "post not found"

        })

    }

    // publish post delete method

    await publishEvent('post.deleted',{
        postId : post._id.toString(),
        userId : req.user.userId,
        mediaIds : post.mediaIds
    })


    await invalidatePostCache(req,req.params.id);
        res.json({
            message : 'post deleted succesfully'
            
        })
    }
    
    catch(e){
        logger.error('error deleting posts',error);
        res.status(500).json({
            success: false,
            message: "error deleting posts by ID"
        });
    }
};

// get single post

const getPost = async(req,res)=>{
    try{
        const postId = req.params.id;
        const cacheKey = `post:${postId}`;
        const cachedPost = await req.redisClient.get(cacheKey);

        if(cachedPost){
            return res.json(JSON.parse(cachedPost));
        }
        const singlePostDetailsbyId = await Post.findById(postId);

        if(!singlePostDetailsbyId){
            return res.status(404).json({
                message: 'post not found',
                success: false
            })
        }

        await req.redisClient.setex(cachedPost,3600,JSON.stringify(singlePostDetailsbyId));
        res.json(singlePostDetailsbyId);
        
        
    }catch(e){
        logger.error('error fetching post',error);
        res.status(500).json({
            success: false,
            message: "error fetching post by ID"
        });
}}
module.exports={createPost,getAllPosts,getPost,deletePost}