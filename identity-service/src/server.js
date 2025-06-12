require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const helmet = require('helmet');
const cors = require('cors');
const {RateLimiterRedis} = require('rate-limiter-flexible');
const {Redis} = require('ioredis');
const {rateLimit} = require('express-rate-limit');
const {RedisStore} = require('rate-limit-redis');
const router = require('./routes/identity-service');
const errorHandler = require('./middleware/errorHandler');
const express = require('express');

const app = express(); 
const PORT = process.env.PORT || 3001

// connect to mongodb

 
console.log(process.env.MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI)
.then(()=>logger.info('connected to database'))
.catch(e=>logger.error('mongo connection error',e));


console.log(process.env.REDIS_URL)
// console.log(REDIS_URL);
const redisclient = new Redis(process.env.REDIS_URL );



//middlewwares

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req,res,next)=>{
    logger.info(`received ${req.method} request to ${req.url}`)
    logger.info(`request body,${req.body}`)
    next()
});

// DDos  protection nd rate limiting

const ratelimiter = new RateLimiterRedis({
    storeClient : redisclient,
    keyPrefix : 'middleware',
    points: 10,                                  //can send 10 requests
    duration : 1
});

app.use((req,res,next)=>{
    ratelimiter.consume(req.ip).then(()=>next()).catch(()=>{
        logger.warn('rate limit exceeded for ip: ${req.ip}');
        res.staus(429).json({
            success: false,
            message: 'too many requests'
        });
    });
});

// ip based rate limiting for sensitive endpoints

const sensitiveEndpointslimiter = rateLimit({
    windowsMS : 15*60*1000,
    MAX : 50,
    standardHeaders : true,
    legacyHeaders : false,  
    handler : (req,res)=>{
        logger.warn(`sensitive endpoint rate limit exceeded for ip: ${req.ip}`);
        res.status(429).json({
        succes: false,
        message: 'too many requests'});
    },
    store : new RedisStore({
        sendCommand : (...args)=>redisclient.call(...args),
    }),
});

// apply this sensitiveendpointslimiter to our routes
  
app.use('/api/auth/register', sensitiveEndpointslimiter);

// routes

app.use('/api/auth', router);

// erroe handler
// c
app.use(errorHandler);

app.listen(PORT, ()=>{
    logger.info(`identity service running on port ${PORT}`);
});


// unhandled promise rejection
process.on('unhandledRejection',(reason,Promise)=>{
    logger.error('unhandled rejection at',Promise,'reason:',reason);
});




















