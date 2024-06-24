const express = require('express')
const Patient = require('../database/patientModel')
const Appointment = require('../database/appointmentModel')
var passport = require('passport');
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
        const appointment = new Appointment({ appointmentDate, session, time: appointmentTime, doctorName, patientName, appointmentRefid: createRefId() })
        await appointment.save();
        res.status(201).json({ message: "New appointment created" })
    } catch (err) {
        res.status(500).json({ message: "Error in creating appointment" })
    }
})

router.post('/getappointments', async (req, res) => {
    const { userId } = req.body
    try {
        const appointments = await Appointment.find({ patientName: userId })
        res.status(201).json({ message: "get all appointment" , appointments})
    } catch (err) {

    }
})


module.exports = router