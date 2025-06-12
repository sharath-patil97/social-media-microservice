const { error } = require('winston')
const logger = require('../utils/logger')

const errorHandler = (err,req,res,next)=>{
    logger.error(error)

    res.status(err.status || 500).json({
        message: err.message || "internal server error",

    });

};

module.exports=errorHandler;