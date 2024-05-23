const express = require('express')
const router =  express.Router()
const User = require('../database/userModel')

router.get('/login',(req,res)=>{
    console.log("inside get admin login")

    
})

router.post('/login',async (req,res)=>{
    //console.log("inside post admin login")
    const filter = {
        email:req.body.email,
        password:req.body.password
    }
    try{
        const user = await User.findOne(filter,{email:1,password:1})
        if(user){
            console.log(user)
            res.status(201).json({message:"User found" })
        }else{
            res.status(500).json({message:"user not found in else blcok"})
        }
    }
    catch(err){
        res.status(401).json({message:"failed post login"})
    }
})
module.exports = router