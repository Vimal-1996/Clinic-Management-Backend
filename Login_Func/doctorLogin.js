const express = require('express')
const router = express.Router()
const Doctor = require('../database/doctorModel')
const Patient = require('../database/patientModel')
const Appointment = require('../database/appointmentModel')
const { ObjectId } = require('mongodb')
const { session } = require('passport')
const Medicine = require('../database/medicineModel');

router.post('/login', async (req, res) => {
    try {
        const { doctorEmail, doctorPassword } = req.body;
        const doctor = await Doctor.findOne({ email: doctorEmail }, { _id: 1, doctorName: 1, email: 1 })
        if (doctor) {
            console.log(doctor)
            res.status(201).json({ message: "User found", doctor })
        } else {
            res.status(500).json({ message: "user not found in else block" })
        }
    } catch (err) {
        res.status(500).json({ message: "user not found in catch block" })
    }
})

router.get('/getappointments', async (req, res) => {
    const today = new Date();
    today.setDate()
    today.setHours(today.getHours(), today.getMinutes(), today.getSeconds(), 0);
    

    const tomorrow = new Date();
    const yesterday = new Date();
    tomorrow.setDate(today.getUTCDate() + 1);
    yesterday.setDate(today.getUTCDate() - 1);

    try {

        const appointmentLists = await Appointment.aggregate([
            {
                $match: { "doctorName": new ObjectId(req.query.id) },
            },
            {
                $match: { "appointmentStatus": "confirmed" }
            },
            {
                $addFields: {
                    convertedDate: {
                        $dateFromString: {
                            dateString: "$appointmentDate"
                        }
                    }
                }
            },
            {
                $facet: {
                    upcomingAppointments: [
                        {
                            $match:{
                                consultationStatus:{$ne:"consulted" }
                            }
                        }, 
                        {
                            $match: {
                                convertedDate: { $gt: today }
                            },
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
                        },
                    ],
                    consultedAppointments: [
                        {
                            $match: {
                                consultationStatus: "consulted"
                            }
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
                        },

                    ],
                    todaysAppointments: [
                        {
                            $match: {
                                convertedDate: { $gt: yesterday, $lt: tomorrow },
                            },
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
                        },
                    ],
                    allAppointments: []
                }
            }
        ])
        res.status(201).json({ message: "message receieved", appointmentLists })
    }
    catch (err) {
        res.status(401).json({ message: err })
    }
})

router.get('/bookings', async (req, res) => {
    const id = req.query.id;
    try {
        const bookings = await Appointment.aggregate([
            {
                $match: { "doctorName": new ObjectId(req.query.id) },
            },
            {
                $match: { consultationStatus: "pending" }
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
            },
            {
                $project: { _id: 1, appointmentDate: 1, session: 1, time: 1,"patientDetails.mobileNumber":1, "patientDetails._id": 1, "patientDetails.patientName": 1, "consultationStatus": 1 }
            }
        ])
        res.status(201).json({ bookings })
    }
    catch (err) {
        res.status(401).json(err)
    }
})

router.get('/getmypatients', async (req, res) => {
    const id = req.query.id;
    try {
        const mypatients = await Appointment.aggregate([
            {
                $match: { "doctorName": new ObjectId(req.query.id) },
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
            },
            {
                $project: { _id: 1, appointmentDate: 1, session: 1, time: 1, "patientDetails._id": 1, "patientDetails.patientName": 1,"patientDetails.mobileNumber":1, "consultationStatus": 1, appointmentRefid: 1 }
            }
        ])
        res.status(201).json({ mypatients })
    } catch (err) {
        res.status(401).json(err)
    }
})

router.get('/getpatientinfo', async (req, res) => {
    const patientId = req.query.patientid;
    try {
        const patientDetails = await Patient.aggregate([
            {
                $match: { _id: new ObjectId(patientId) }
            },
            {
                $project: { patientName: 1, age: 1 }
            }
        ])
        res.status(201).json({ patientDetails })
    } catch (err) {

    }
})

router.post('/prescriptiondetails', async (req, res) => {
    try {
        const medicine = new Medicine({ patientId: (req.body.patientId), medicines: req.body.text.split('\n') })
        await medicine.save();
        const updatedAppointment = await Appointment.findOneAndUpdate(
            { appointmentRefid: req.body.appointmentReferenceId },
            { consultationStatus: "consulted"},)
           .then(()=>{
            console.log("successfully updated appointment")
           })
            .catch((error) => {
                console.log("Error during update")
            })

        if (!updatedAppointment) {
            console.log('No document found with the given reference ID:', req.body.appointmentReferenceId);
        } else {
            console.log('Updated Appointment:', updatedAppointment);
        }
        res.status(201).json({ message: "New prescription created" })
    } catch (err) {
        res.status(500).json({ message: "Error in creating medicines" })
    }
})

module.exports = router