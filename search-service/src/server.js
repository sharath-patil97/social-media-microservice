require('dotenv').config();
require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const helmet = require('helmet');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const express = require('express');
const { connectToRabbitMQ,consumeEvent } = require('./utils/rabbitmq');
const {Redis} = require('ioredis');
const seachRoutes = require('./router/search-router');
const { handlePostCreated,handlePostDeleted } = require('./event-handler/search-event-handler');


const app = express();
const PORT = process.env.PORT || 3004;

mongoose.connect(process.env.MONGODB_URI)
.then(()=>logger.info('connected to database'))
.catch(e=>logger.error('mongo connection error',e));





const redisClient = new Redis(process.env.REDIS_URL)

// console.log(process.env.REDIS_URL)



//middlewwares

app.use(helmet());
app.use(cors());
app.use(express.json());





app.use((req,res,next)=>{
    logger.info(`received ${req.method} request to ${req.url}`)
    logger.info(`request body,${req.body}`)
    next()
});

app.use('/api/search',seachRoutes);

app.use(errorHandler);

async function startServer() {
    try{
        await connectToRabbitMQ();
               app.listen(PORT, ()=>{
            logger.info(`search service running on port ${PORT}`);
        });

        // consume the events or subscribe the event
        await consumeEvent('post.created',handlePostCreated)
        await consumeEvent('post.deleted',handlePostDeleted)

    

    }catch(e){
        logger.error(e,'failed to start search service')
    }
    
}

startServer();
