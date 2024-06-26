const express = require('express')
const router = express.Router()
const Admin = require('../database/adminModel')
const Patient = require('../database/patientModel');
const Doctor = require('../database/doctorModel');
const Appointment = require('../database/appointmentModel')

const { generateWebToken,verifyWebToken } = require('../jwt/jwtfunctions');
const { session } = require('passport');


router.get('/login', (req, res) => {
    console.log("inside get admin login")
})

router.post('/login', async (req, res) => {
   
    const filter = {
        email: req.body.email,
        password: req.body.password
    }
    try {
        const admin = await Admin.findOne(filter, { _id: 1, email: 1, password: 1 })
        if (admin) {
            const payload = { userId: admin._id, email: admin.email }
            await generateWebToken(payload).then((token) => { res.status(201).json({ message: "User found",token:token})}).catch((err) => {  res.status(500).json({ message: "User doesn't exist, Check your username and password" })})  
        } else {
            res.status(500).json({ message: "User doesn't exist, Check your username and password" })
        }
    }
    catch (err) {
        res.status(401).json({ message: "failed post login" })
    }
})


router.get('/doctorDetails',async(req,res)=>{
    try{  
        const doctors =await Doctor.find({},{_id:1,doctorName:1,specialised:1,speciality:1,role:1,accountStatus:1})
        if(doctors){
            res.status(201).json({doctors:doctors})
        }else{
            res.status(500).json({ message: "Error fetching patient details" })
        }
    }catch(err){
        res.status(401).json({ message: "failed api call" })
    }
})

router.get('/patientDetails',async(req,res)=>{
    try{  
        
        const patients =await Patient.find({},{_id:1,patientName:1,age:1,mobileNumber:1,role:1,accountStatus:1})
        if(patients){
            res.status(201).json({patients:patients})
        }else{
            res.status(500).json({ message: "Error fetching patient details" })
        }
    }catch(err){
        res.status(401).json({ message: "failed api call" })
    }
})


router.post('/addnewdoctor',async(req,res)=>{
    const {doctorName,specialised,speciality} = req.body
    try{
        const doctor = new Doctor({doctorName,specialised,speciality,accountStatus:true, email:`${doctorName}@gmail.com`, password:"123456"})
        await doctor.save();
        res.status(201).json({message:"New Doctor created"})
    }
    catch(err){
        res.status(401).json({message:"Doctor creation failed"})
    }
    
    
})

router.post('/addnewpatient',async(req,res)=>{
    const {patientName, patientAge, patientMobileNumber} = req.body
    try{
        const patient = new Patient({patientName,age:patientAge,mobileNumber:patientMobileNumber,accountStatus:true,email:`${patientName}@gmail.com`, password:`${patientName}`})
        await patient.save();
        res.status(201).json({message:"New Patient created"})
    }
    catch(err){
        res.status(401).json({message:"Patient creation failed"})
    }
})

router.post('/addnewappointment',async(req,res)=>{
    
    
    const {appointmentDate,
        appointmentTime,
        session,
        doctorName,
        patientName} = req.body

    function createRefId(){
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
      }
    

    try{
        const appointment = new Appointment({appointmentDate:appointmentDate,session:session,time:appointmentTime,doctorName:doctorName,patientName:patientName,appointmentRefid:createRefId(),appointmentVisibile:true,appointmentStatus:"Confirmed"})
        await appointment.save();
        res.status(201).json({message:"New Appointment created"})
    }
    catch(err){
        res.status(401).json({message:"Appointment creation failed"})
    }
})

router.get('/allappointments',async(req,res)=>{
    try{
        const appointmentQueryResult = await Appointment.aggregate([
            {
                $lookup: {
                    from: "doctors",           
                    localField: "doctorName",  
                    foreignField: "_id",       
                    as: "doctorDetails"
                  }
            },
            {
                $unwind:"$doctorDetails"
            },
            {
                $lookup:{
                    from:"patients",
                    localField:"patientName",
                    foreignField:"_id",
                    as:"patientDetails"
                }
            },
            {
                $unwind:"$patientDetails"
            }
        ]);
        res.status(200).json({"appointments":appointmentQueryResult})
    }catch(err){
        console.log(err)
        res.status(401).json({"Error":err});
    }
})


module.exports = router