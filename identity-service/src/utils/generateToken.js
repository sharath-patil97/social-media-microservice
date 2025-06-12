const jwt=require('jsonwebtoken')
const crypto=require('crypto')
const RefreshToken=require('../models/refresh-token')
const { date } = require('joi')

const generateToken=async(user)=>{
    const accessToken = jwt.sign({
        userId: user._id,
        username : user.username

    },process.env.JWT_SECRET, {expiresIn: '60m'})


    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7)    //refresh token expire in 7 days

    await RefreshToken.create({

        Token: refreshToken,
        user: user._id,
        expiresAt:expiresAt,
    
    })
    return {accessToken,refreshToken}
}
module.exports = generateToken