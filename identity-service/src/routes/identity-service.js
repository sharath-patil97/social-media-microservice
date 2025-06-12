const express = require('express');
const router = express.Router();
const {registeruser,loginUser,refreshTokenUser,logoutUser} = require('../controller/identityController');
// const registerUser = require('../controller/identityController');


router.post('/register',registeruser);
router.post('/login',loginUser);
router.post('/refresh-token',refreshTokenUser);
router.post('/logout',logoutUser);
module.exports= router;  



