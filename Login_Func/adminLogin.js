const express = require('express')
const router = express.Router()
const Admin = require('../database/adminModel')
const Patient = require('../database/patientModel');
const Doctor = require('../database/doctorModel');
const Appointment = require('../database/appointmentModel')

const { generateWebToken, authenticateToken } = require('../jwt/jwtfunctions');
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
            const payload = { userId: admin._id, email: admin.email, role: req.body.role }
            await generateWebToken(payload).then((token) => { res.status(201).json({ message: "User found", token: token }) }).catch((err) => { res.status(500).json({ message: "User doesn't exist, Check your username and password" }) })
        } else {
            res.status(500).json({ message: "User doesn't exist, Check your username and password" })
        }
    }
    catch (err) {
        res.status(401).json({ message: "failed post login" })
    }
})


router.get('/doctorDetails',  async (req, res) => {
    try {
        const doctors = await Doctor.find({}, { _id: 1, doctorName: 1, specialised: 1, speciality: 1, role: 1, accountStatus: 1 }) .sort({"doctorName":1})
        if (doctors) {
            res.status(201).json({ doctors: doctors })
        } else {

            res.status(500).json({ message: "Error fetching doctor details" })
        }
    } catch (err) {
        res.status(401).json({ message: "failed api call" })
    }
})

router.get('/patientDetails',  async (req, res) => {
    try {

        const patients = await Patient.find({}, { _id: 1, patientName: 1, age: 1, mobileNumber: 1, role: 1, accountStatus: 1 }).sort({"patientName":1})
        if (patients) {

            res.status(201).json({ patients: patients })
        } else {

            res.status(500).json({ message: "Error fetching patient details" })
        }
    } catch (err) {
        res.status(401).json({ message: "failed api call" })
    }
})


router.post('/addnewdoctor', async (req, res) => {
    const { doctorName, specialised, speciality } = req.body
  
    try {
        const doctor = new Doctor({ doctorName, specialised, speciality, accountStatus: true, email: `${doctorName.toLowerCase()}@gmail.com`, password: "123456" })
        await doctor.save();
        res.status(201).json({ message: "New Doctor created" })
    }
    catch (err) {
        res.status(401).json({ message: "Doctor creation failed" })
    }


})

router.post('/addnewpatient', async (req, res) => {
    const { patientName, patientAge, patientMobileNumber } = req.body
    try {
        const patient = new Patient({ patientName, age: patientAge, mobileNumber: patientMobileNumber, accountStatus: true, email: `${patientName}@gmail.com`, password: `${patientName}` })
        await patient.save();
        res.status(201).json({ message: "New Patient created" })
    }
    catch (err) {
        res.status(401).json({ message: "Patient creation failed" })
    }
})

router.post('/addnewappointment', async (req, res) => {


    const { appointmentDate,
        appointmentTime,
        session,
        doctorName,
        patientName } = req.body

    function createRefId() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }


    try {
        const appointment = new Appointment({ appointmentDate: appointmentDate, session: session, time: appointmentTime, doctorName: doctorName, patientName: patientName, appointmentRefid: createRefId(), appointmentVisibile: true, appointmentStatus: "confirmed", consultationStatus:"pending" })
        await appointment.save();
        res.status(201).json({ message: "New Appointment created" })
    }
    catch (err) {
        res.status(401).json({ message: "Appointment creation failed" })
    }
})

router.get('/allappointments', async (req, res) => {
    try {
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
                $unwind: "$doctorDetails"
            },
            {
                $lookup: {
                    from: "patients",
                    localField: "patientName",
                    foreignField: "_id",
                    as: "patientDetails"
                }
            },
            {
                $unwind: "$patientDetails"
            }
        ]);
        res.status(200).json({ "appointments": appointmentQueryResult })
    } catch (err) {
        console.log(err)
        res.status(401).json({ "Error": err });
    }
})

router.post('/updateappointmentstatus', async (req, res) => {
    var appointmentStatusVariable;
    if (req.body.appointmentStatus === 'confirmed') {
        appointmentStatusVariable = 'pending'
    } else {
        appointmentStatusVariable = 'confirmed'
    }
    await Appointment.findOneAndUpdate({ appointmentRefid: req.body.referenceId }, { appointmentStatus: appointmentStatusVariable })
        .catch((error) => {
            console.log("Error during update")
        })
    res.status(201).json({ message: "updated appointment status" })
})

router.get('/deletedoctor', authenticateToken, async (req, res) => {
    await Doctor.findByIdAndDelete(req.query.doctorid)
        .then((res) => console.log(res))
        .catch((error) => {
            console.log("Error during update")
        })
    res.status(201).json({ message: "doctor successfully deleted" })
})

router.get('/deletepatient',  authenticateToken, async (req, res) => {
  
    await Patient.findByIdAndDelete(req.query.patientid)
        .then((res) => console.log(res))
        .catch((error) => {
            console.log("Error during update")
        })
     res.status(201).json({ message: "patient successfully deleted" })
})

router.post('/editdoctor',authenticateToken,async(req,res)=>{
    await Doctor.findOneAndUpdate({_id:req.body.id},{doctorName:req.body.doctorName, specialised:req.body.specialisedValue, speciality:req.body.specialityValue})
    .then((res)=>{})
    .catch((err)=>{})
    res.status(201).json({"message":"doctor updated"}) 
})


router.post('/editpatient',authenticateToken,async(req,res)=>{
    await Patient.findOneAndUpdate({_id:req.body.id},{age:req.body.age, mobileNumber:req.body.mobileNumber})
    .then((res)=>{})
    .catch((err)=>{})
    res.status(201).json({"message":"patient updated"}) 
})
module.exports = router