require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const helmet = require('helmet');
const cors = require('cors');
// const {RateLimiterRedis} = require('rate-limiter-flexible');
const {Redis} = require('ioredis');
// const {rateLimit} = require('express-rate-limit');
// const {RedisStore} = require('rate-limit-redis');
// const router = require('./routes/identity-service');
const errorHandler = require('./middleware/errorHandler');
const express = require('express');
const router = require('./routes/post-routes');
const { connectToRabbitMQ } = require('./utils/rabbitmq');

const app = express(); 
const PORT = process.env.PORT || 3002;

// connect to mongodb

 
// console.log(process.env.MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI)
.then(()=>logger.info('connected to database'))
.catch(e=>logger.error('mongo connection error',e));





const redisClient = new Redis(process.env.REDIS_URL)





//middlewwares

app.use(helmet());
app.use(cors());
app.use(express.json());





app.use((req,res,next)=>{
    logger.info(`received ${req.method} request to ${req.url}`)
    logger.info(`request body,${req.body}`)
    next()
});

// routes->pass redis client to routes.

app.use('/api/posts',(req,res,next)=>{
    req.redisClient =  redisClient;
    next();
},router)

app.use(errorHandler);

async function startServer(){
    try{
        await connectToRabbitMQ();
        app.listen(PORT, ()=>{
    logger.info(`post service running on port ${PORT}`);
});

    }catch(error){
        logger.error('failed to connect to server',error)
        process.exit(1)
    }
    
}

startServer();

//      app.listen(PORT, ()=>{
//     logger.info(`post service running on port ${PORT}`);
// })




// unhandled promise rejection
process.on('unhandledRejection',(reason,Promise)=>{
    logger.error('unhandled rejection at',Promise,'reason:',reason);
});