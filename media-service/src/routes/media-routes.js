const express = require('express');
const multer = require('multer');


const {uploadMedia, getAllMedia} = require('../controllers/media-controller')
const {authenticateRequest} = require('../middleware/auth-middleware');
const logger = require('../utils/logger');
const router = express.Router();


// configure multer for file upload

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize : 5*1024*1024
    }
}).single('file')

router.post('/upload',authenticateRequest,(req,res,next)=>{
    upload(req,res,function(err){
        if(err instanceof multer.MulterError){
            logger.error('multer error while uploaading:',err)
            return res.status(400).json({
                message: 'multer error while uploaading',
                error: err.message,
                stack : err.stack
            })
        }else if(err){
             logger.error('unknwon  error occured while uploaading:',err)
            return res.status(500).json({
                message: 'unknown  error while uploaading',
                error: err.message,
                stack : err.stack
            })

        }if(!req.file){
            return res.status(400).json({
                message: 'no file found!'

        })
    }
    next()
})
},uploadMedia)


router.get('/get',authenticateRequest,getAllMedia);


module.exports=router;


