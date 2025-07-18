const amqp =require('amqplib');
const logger = require('./logger');
const { connect } = require('mongoose');


let connection = null;
let channel = null;

const EXCHANGE_NAME = 'facebook events'

async function connectToRabbitMQ() {
    try{
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, 'topic',{durable:false})
        logger.info('connected to rabbitmq')
        return channel;
        

    }catch(e){
        logger.error('error connecting to rabbitmq',e)
    }
    
}

async function publishEvent(routingKey,message) {
    if(!channel){
        await connectToRabbitMQ();
    }
    channel.publish(EXCHANGE_NAME,routingKey,Buffer.from(JSON.stringify(message)))
    logger.info(`event published: ${routingKey}`)
    
}
module.exports= {connectToRabbitMQ, publishEvent};