const jwt= require('jsonwebtoken');
const User= require('../models/user');
const dotenv = require('dotenv');
const Admin = require('../models/admin');
dotenv.config();

exports.authenticate= async (req, res, next)=>{
    try{
        const token = req.header('Authorization');
        console.log(token);
        const user= jwt.verify(token, process.env.JWT_TOKEN);
        console.log('userId =>', user.userId);
        User.findById(user.userId)
        .then(user=>{
            req.user= user;
            next();
        })
    }
    catch(err){
        console.log(err);
        return res.status(401).json({message: "Authorization failed"});
    }
}


// Admin
exports.authenticateAdmin= async (req, res, next)=>{
    try{
        const adminToken = req.header('adminAuthorization');
        console.log(adminToken);
        const admin= jwt.verify(adminToken, process.env.JWT_TOKEN);
        console.log('adminId =>', admin.adminId);
        Admin.findById(admin.adminId)
        .then(admin=>{
            req.admin= admin;
            next();
        })
    }
    catch(err){
        console.log(err);
        return res.status(401).json({message: "Authorization failed"});
    }
}