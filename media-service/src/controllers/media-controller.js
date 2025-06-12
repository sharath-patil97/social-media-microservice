const { uploadMediaToCloudinary } = require('../utils/cloudinary');
const logger = require('../utils/logger');
const Media = require('../models/Media');

const uploadMedia =  async(req,res)=>{
    logger.info('starting media upload')
    try{
        if(!req.file){
            logger.error('no file found.please adda file and try again')
            return res.status(400).json({
                message:'no file found.please adda file and try again',
                success: false
            })
        }
        const {originalname,mimetype,buffer}  = req.file
        const userId = req.user.userId

        logger.info(`file details: name=${originalname},type=${mimetype}`);
        logger.info('uploading to cloudinary starting...')

        const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file)
        logger.info(`cloudinary upload successfully. publicId: -${cloudinaryUploadResult.public_id}`)


        const newlyCreatedMedia = new Media({
            publicId: cloudinaryUploadResult.public_id,
            originalname,
            mimetype,
            url: cloudinaryUploadResult.secure_url,
            userId
        })

        await newlyCreatedMedia.save()

        res.status(201).json({
            success: true,
            mediaId: newlyCreatedMedia._id,
            url: newlyCreatedMedia.url,
            message: 'media upload successfully'

        })
    }catch(error){
         logger.error('error fetching post',error);
                res.status(500).json({
                    success: false,
                    message: "error fetching post by ID"
                });

    }
}

const getAllMedia = async(req,res)=>{
    try{
        const results = await Media.find({})
        res.json({results})

    }catch(error){
         logger.error('error fetching meias',error);
                res.status(500).json({
                    success: false,
                    message: "error fetching medias"
                });

    }
}



module.exports= {uploadMedia,getAllMedia};