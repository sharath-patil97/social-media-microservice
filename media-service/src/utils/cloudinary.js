const cloudinary = require('cloudinary').v2
const logger = require('./logger');
const { error } = require('winston');

cloudinary.config({
    cloud_name: process.env.cloud_name ,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});


const uploadMediaToCloudinary=(file) =>{

    // return new Promise((resolve, reject) => {
    //     if (!file || !file.buffer) {
    //       return   reject(new Error('Invalid file or missing buffer'));
    //     }

    //     const uploadStream = cloudinary.uploader.upload_stream(
    //         { 
    //             resource_type: "auto"
    //          },
    //         (error, result) => {
    //             if (error) {
    //                 logger.error('Error while uploading to Cloudinary:', error);
    //                 return reject(error);
    //             }else{
    //                return  resolve(result);

    //             }
    //             // resolve(result);
    //         }
    //     );   
    //      uploadStream.end(file.buffer);
    // });
  return new Promise((resolve, reject) => {
        console.log("Starting upload. File:", file);

        if (!file || !file.buffer) {
            console.log("Missing file or buffer");
            return reject(new Error('Invalid file or missing buffer'));
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
                if (error) {
                    console.log("Cloudinary error:", error);
                    return reject(error);
                }
                console.log("Upload success:", result);
                resolve(result);
            }
        );

        console.log("Calling uploadStream.end");
        uploadStream.end(file.buffer);
    });
};

 const deleteMediaFromCloudinary = async(publicId)=>{
    try{
        const result = cloudinary.uploader.destroy(publicId)
        logger.info('media deleted successfully from cloud storage',publicId)
        return result;

    }catch(error){
        logger.error('error deleting media from clouinary',deleteMediaFromClouinary)
        throw error
    }
 }
    



module.exports= {uploadMediaToCloudinary,deleteMediaFromCloudinary}