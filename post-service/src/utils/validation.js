const joi = require('joi')

const validateCreatePost = (data)=>{
    const schema = joi.object({
        content: joi.string().min(3).max(5000).required(),
        
    }).unknown(true);

    return schema.validate(data)
    }


module.exports={validateCreatePost};