const logger = require('../utils/logger');

const authenticateRequest = (req,res,next)=>{
    const userId = req.headers['x-user-id']

    if(!userId){
        logger.warn('accessttempted withour user id');
        res.status(401).json({
            successs:false,
            message:'authentication required plese login to continue'
        })
       

    }
    req.user = {userId};
    next()

}; 

module.exports={authenticateRequest}