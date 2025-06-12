const mongoose = require('mongoose');

const mediaScheme = new mongoose.Schema({

    publicId :{
        type:String,
        required : true
    },
    originalname:{
         type:String,
        required : true

    },
    mimetype:{
         type:String,
        required : true

    },
    url:{
           type:String,
        required : true
    },
    userId:{
           type:String,
        required : true
    }

    },{timestamps:true}
)

const Media = mongoose.model('Media',mediaScheme)

module.exports= Media;