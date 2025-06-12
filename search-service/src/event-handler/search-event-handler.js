const Search = require('../models/Search')
const logger = require('../utils/logger')


async function handlePostCreated(event){
    try{
        const newSearchPost = new Search({
            postId : event.postId,
            userId: event.userId,
            content : event.content,
            createdAt: event.createdAt
        })

        await newSearchPost.save()
        logger.info(`search post created: ${event.postId},${newSearchPost._id.toString()} `)

    
    }catch(e){
        logger.error(e,'error handling post creation post')
    }

}

async function handlePostDeleted(event){
    try{
        await Search.findOneAndDelete({postId: event.postId })
        logger.info(`search post deleted : ${event.postId}`)
    }catch(error){
        logger.error(error,'error handling post deletion post')


    }
}

module.exports = {handlePostCreated,handlePostDeleted};