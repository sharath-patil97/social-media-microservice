const mongoose= require('mongoose')
const user = require('./user')

const refreshTokenSchema = new mongoose.Schema({
    Token:{
        type: String,
        required: true,
        unique: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: user,
        required: true
    },
    expiresAt:{
        type:Date,
        required:true
    }
},
    {timestamps:true}
);

refreshTokenSchema.index({expiresAt:1},{expireAfterSeconds:0});

const RefreshToken = mongoose.model('refreshToken', refreshTokenSchema);
module.exports=RefreshToken;
