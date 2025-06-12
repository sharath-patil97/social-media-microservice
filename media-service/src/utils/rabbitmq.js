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

async function consumeEvent(routingKey,callback) {
    if(!channel){
        await connectToRabbitMQ();
    }

    const q = await channel.assertQueue("",{exclusive:true});
    await channel.bindQueue(q.queue,EXCHANGE_NAME,routingKey)
    channel.consume(q.queue,(msg)=>{
        if(msg!=null){
            const content = JSON.parse(msg.content.toString());
            callback(content)
            channel.ack(msg)
        }
    })
    logger.info(`subscribe to event : ${routingKey}`)
    
}
module.exports= {connectToRabbitMQ, publishEvent,consumeEvent};