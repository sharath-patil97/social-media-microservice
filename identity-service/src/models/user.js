const mongoose = require('mongoose');
const argon2d = require('argon2');



const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true

    },
    password: {
        type: String,
        required: true
        
    },
    createdAt: {
        type: Date,
        required: false,
        
    }
},
    {
    timestamps : true,
    }
   
    
);

userSchema.pre('save', async function(next) {
    if(this.isModified('password')){
        try{
            this.password=await argon2d.hash(this.password)
        }catch(error){
            return next(error)
        }
        
    } 
    
})

userSchema.methods.comparePassword=async function(candidatePassword){
    try{
        return await argon2d.verify(this.password,candidatePassword)
    }catch(error){
        throw error
    }
}
    
userSchema.index({username:'text'});

const user = mongoose.model('user',userSchema);
module.exports=user;
