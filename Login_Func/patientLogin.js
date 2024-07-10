const express = require('express')
const Patient = require('../database/patientModel')
const Appointment = require('../database/appointmentModel')
var passport = require('passport');
const {ObjectId} = require('mongodb')
const router = express.Router()


function createRefId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

router.get('/', async (req, res) => {

});


router.get('/login', async (req, res) => {
    console.log("server hit occured in get method")

})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const patient = await Patient.findOne({ email: req.body.email }, { _id: 1, patientName: 1, email: 1 })
        if (patient) {
            console.log(patient)
            res.status(201).json({ message: "User found", patient })
        } else {
            res.status(500).json({ message: "user not found in else blcok" })
        }
    } catch (err) {
        res.status(500).json({ message: "user not found in catch block" })
    }
})


router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const newPatient = new Patient({ username, password })
        await newPatient.save();
        res.status(201).json({ message: "New User Created" })
    } catch (err) {
        res.status(500).json({ message: "Error in creating user" })
    }
})

router.post('/appointment', async (req, res) => {
    try {
        const { appointmentDate, appointmentTime, session, doctorName, patientName } = req.body
        const appointment = new Appointment({ appointmentDate, session, time: appointmentTime, doctorName, patientName, appointmentRefid: createRefId(), appointmentStatus:"Pending",consultationStatus:"pending" })
        await appointment.save();
        res.status(201).json({ message: "New appointment created" })
    } catch (err) {
        res.status(500).json({ message: "Error in creating appointment" })
    }
})

router.post('/getappointments', async (req, res) => {
    const { userId } = req.body
    try {
        const appointments = await Appointment.aggregate([
            {
                $match:{"patientName":new ObjectId(userId)}
              // $match:{"patientName":ObjectId.createFromTime(parseInt(userId,10))}
            },
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
            },
            {
                $project:{appointmentDate:1, session:1, time:1,appointmentStatus:1,appointmentVisible:1,appointmentRefid:1,"doctorDetails.doctorName":1,"patientDetails.patientName":1}
            }
        ])
        res.status(201).json({ message: "get all appointment" , appointments})
    } catch (err) {
        res.status(500).json({ message: "Error in getting appointment" })
    }
})

router.get('/getpatientdetails',async(req,res)=>{
    const userId = req.query.id
    console.log(userId)
    try{
        const patient = await Patient.findById(userId).exec()
        if (patient) {
            console.log(patient)
            res.status(201).json({ message: "User found", patient })
        } else {
            res.status(500).json({ message: "user not found in else blcok" })
        }
    }
    catch(err){
        console.log(err)
    }
})

router.post('/savepatientdetails',async(req,res)=>{
    const {_id, patientName,age, mobileNumber, email, password} = req.body.userInfo
    try{
       const patient = await Patient.findByIdAndUpdate(_id,{patientName,age,mobileNumber,email,password})
       res.status(201).json({message:"Patient Updated"})
    }catch(err){
        res.status(401).json({err})
    }
})


module.exports = router