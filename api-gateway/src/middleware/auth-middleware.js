const { error } = require('console');
const user = require('../../../identity-service/src/models/user');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

const validateToken = (req,res,next)=>{
   
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

if(!token){
    logger.warn('access attemt without valid token')
    return res.status(401).json({
        message: 'authentication required',
        success: false
    })
}

jwt.verify(token,process.env.JWT_SECRET ,(err,user)=>{
    if(err){
        logger.warn('invalid token')
        return res.status(429).json({
        message: 'invalid token',
        success: false
    })

    }
    req.user=user;
    
      next();
})

};

module.exports={validateToken};