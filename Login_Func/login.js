const express = require('express')
const User = require('../database/userModel')
var passport = require('passport');
const router = express.Router()

router.get('/',async(req,res)=>{
   
});


router.get('/login',async(req,res)=>{
    console.log("server hit occured in get method")

})

router.post('/login',async(req,res)=>{
    try{ 
        const {username,password} = req.body;
        const user = await User.findOne({username:req.body.username})
        if(user){
            console.log(user)
            res.status(201).json({message:"User found" })
        }else{
            res.status(500).json({message:"user not found in else blcok"})
        }
    }catch(err){
        res.status(500).json({message:"user not found in catch block"})
    }
})


router.post('/register',async(req,res)=>{
    try{
        const {username,password} = req.body;
        const newUser = new User({username,password})
        await newUser.save();
        res.status(201).json({message:"New User Created"})
    }catch(err){
        res.status(500).json({message:"Error in creating user"})
    }
})


module.exports = router