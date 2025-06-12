require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const mediaRoutes = require('./routes/media-routes');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
// const e = require('express');
const {connectToRabbitMQ,consumeEvent} = require('./utils/rabbitmq');
const { handlePostDeleted } = require('./event-handler/media-event-handler');

const app = express();
const PORT = process.env.PORT || 3003

// connect to mongodb
// console.log("🔍 MONGODB_URI =", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
.then(()=>logger.info('connected to mongodb'))
.catch((e)=>logger.error('mongo connection error',e));

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req,res,next)=>{
    logger.info(`received ${req.method} request to ${req.url}`)
    // logger.info(`request body,${req.body}`)
    next()
});

app.use('/api/media',mediaRoutes);
app.use(errorHandler);

async function startServer(){
    try{
        await connectToRabbitMQ();

        // consume all events
        await consumeEvent('post.deleted',handlePostDeleted)
        app.listen(PORT, ()=>{
    logger.info(`media service running on port ${PORT}`);
});

    }catch(error){
        logger.error('failed to connect to server',error)
        process.exit(1)
    }
    
}

startServer();

// app.listen(PORT, ()=>{
//     logger.info(`media service running on port ${PORT}`);
// });


// unhandled promise rejection
process.on('unhandledRejection',(reason,Promise)=>{
    logger.error('unhandled rejection at',Promise,'reason:',reason);
});

