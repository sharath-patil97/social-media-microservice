const logger = require('../utils/logger')
const {validateRegistration,validateLogin} = require('../utils/validation')
//  const {accessToken, RefreshToken} = require('../utils/generateToken')
const generateToken = require('../utils/generateToken');
const User = require('../models/user');

// user registration
const registeruser = async(req,res)=>{
    logger.info('registration endpoint hit....')
    try{

        //validate the schema
        const {error} = validateRegistration(req.body);
         if(error){
            logger.warn('validation error',error.details[0].message );
            return res.status(400).json({
                success : false,
                message: error.details[0].message

            });
             
        }
        const {email,password,username} = req.body

        let user = await User.findOne({$or: [{username},{email}]});
        if(user){
            logger.warn('user already exists ');
            return res.status(400).json({
                success : false,
                message: 'user already exists'
            });

            
        }

        user= new User({username,email,password})
        await user.save()
        logger.warn('user saved successfully ',user._id);

        const {accessToken, refreshToken} = await generateToken(user)
        res.status(201).json({
            success : true,
            message: 'user registered successfully', 
            accessToken,
            refreshToken
        })
        

    }catch(e){
         logger.error('registration error occured',e)
         res.status(500).json({
            success: false,
            message: 'internal server error'
         })
        }
    

};


//user login

const loginUser = async(req,res)=>{
    logger.info('login endpoint hit...');
    try{
          const {error} = validateLogin(req.body);
            if(error){
            logger.warn('validation error',error.details[0].message );
            return res.status(400).json({
                success : false,
                message: error.details[0].message

            });
             
        }
        const {email,password}= req.body;
        const user = await User.findOne({email});
        if(!user){
            logger.warn('invalid user')
            return res.status(400).json({
                success: false,
                message: 'invalid credentials'

            })


        }

        //valid password or not
        const isValidPassword = await user.comparePassword(password)
        if(!isValidPassword){
                logger.warn('invalid password')
            return res.status(400).json({
                success: false,
                message: 'invalid password' 
            })

        }

        const {accessToken,refreshToken} = await generateToken(user);
        res.json({
            accessToken,
            refreshToken,
            userId:user._id
        });



    }catch(e){
         logger.error('login error occured',e)
         res.status(500).json({
            success: false,
            message: 'internal server error'
         })
        }
    };


    //refresh token

    const refreshTokenUser=async(req,res)=>{
        logger.info('refresh token endpoint hit...');
        try{
            const {refreshToken}=req.body
              if(!refreshToken){
            logger.warn('refresh token missing')
            return res.status(400).json({
                success: false,
                message: 'refresh token missing'

            })


        } 
        const storedToken= await RefreshToken.findOne({token:refreshToken})
        if(!storedToken || storedToken.expiresAt < new Date()){
             logger.warn('invalid or expired refresh token')
             return res.status(401).json({
                success: false,
                message: 'invalid or expired refresh token'
            })
        }

        const user =await User.findById(storedToken.user)

        if(!user){
              logger.warn('user not found')
             return res.status(401).json({
                success: false,
                message: 'user not found'
            })

        }
        const {accessToken:newaccessToken, refreshToken: newrefreshToken}= await generateToken(user)


        // dalete the old refresh token

        await RefreshToken.deleteOne({_id: storedToken._id})

        res.json({
            accessToken: newaccessToken,
            refreshToken: newrefreshToken
        })

        
            
        }catch(e){
         logger.error('refresh token error occured',e)
         res.status(500).json({
            success: false,
            message: 'internal server error'
         })
        }


    }

    const logoutUser = async(req,res)=>{
         logger.info('error while loggong out',e)
         try{


            const {refreshToken}=req.body
             if(!refreshToken){
                logger.warn('refresh token missing');
                return res.status(400).json({
                    success: false,
                    message: 'refresh token missing'
                });
              
         }

            await RefreshToken.deleteOne({token: refreshToken})
            logger.info('refresh token deleted for logout')

             res.json({
                success:true,
                message: 'logged out succesfully',
            })
            



     }catch(e){ 
        res.status(500).json({
        success: false,
        message: 'internal server error'}
         
            
        )}

    }
module.exports = {registeruser,loginUser,refreshTokenUser, logoutUser};