require('dotenv').config()
const express= require('express')
const cors=require('cors')
const {Redis} = require('ioredis')
const helmet= require('helmet')
const {rateLimit}=require('express-rate-limit')
const{RedisStore}=require('rate-limit-redis')
const logger = require('./utils/logger')
const proxy = require(`express-http-proxy`)
const errorHandler = require('./middleware/errorHandler')  
const {validateToken}=require('./middleware/auth-middleware');


const app = express();
const PORT=process.env.PORT || 3000;

const redisclient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());


//rate limiting

const rateLimitOptions = rateLimit({
    windowsMS : 15*60*1000,
    MAX : 100,
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

app.use(rateLimitOptions );

app.use((req,res,next)=>{
    logger.info(`received ${req.method} request to ${req.url}`)
    // logger.info(`request body,${req.body}`)
    next();
});

const proxyOptions = {
    proxyReqPathResolver : (req)=>{
        return req.originalUrl.replace(/^\/v1/,"/api")
    },
    proxyErrorHandler:(err,res,next)=>{
        logger.error(`proxy error: ${err.message}`);
        res.status(500).json({
            message: `internal server error`,error:err.message
        })
        
    }

}
    
//setting up proxy for our identity service
// we can add or change content type here,

app.use('/v1/auth',proxy(process.env.IDENTITY_SERVICE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers["content-type"]="application/json"
        return proxyReqOpts
    },
    userResDecorator: (proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`response received from identity service:${proxyRes.statusCode}`)
        console.log(proxyResData)

        return proxyResData
    }
    
}

) ); 


//setting up proxy for our post service
app.use('/v1/posts',validateToken,proxy(process.env.POST_SERVICE_URL ,{
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers["content-type"]="application/json"
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId

        return proxyReqOpts
    },
    userResDecorator: (proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`response received from post service service:${proxyRes.statusCode}`)
        console.log(proxyResData)

        return proxyResData
    }

}))


// setting up proxy for our mediaservice
app.use('/v1/media',validateToken,proxy(process.env.MEDIA_SERVICE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
        if(!srcReq.headers["content-type"].startsWith('multipart/form-data')){
            proxyReqOpts.headers["content-type"]="application/json"

        }
        return proxyReqOpts
    },
        userResDecorator: (proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`response received from media service service:${proxyRes.statusCode}`)
        console.log(proxyResData)

        return proxyResData
    },
    parseReqBody : false

}))
//setting up proxy for our search service
app.use('/v1/search',validateToken,proxy(process.env.SEARCH_SERVICE_URL ,{
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers["content-type"]="application/json"
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId

        return proxyReqOpts
    },
    userResDecorator: (proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`response received from search service service:${proxyRes.statusCode}`)
        console.log(proxyResData)

        return proxyResData
    }

}))


 

app.use(errorHandler);

app.listen(PORT,()=>{
    logger.info(`api gateway is running on port ${PORT}`)
    logger.info(`identity service is running on port ${process.env.IDENTITY_SERVICE_URL}`)
    logger.info(`redis url ${process.env.REDIS_URL}`)
    logger.info(`post service is running on port ${process.env.POST_SERVICE_URL}`)
     logger.info(`media service is running on port ${process.env.MEDIA_SERVICE_URL}`)
     logger.info(`search service is running on port ${process.env.SEARCH_SERVICE_URL}`)
});




  