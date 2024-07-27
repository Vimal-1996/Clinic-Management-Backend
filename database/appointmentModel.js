const mongoose = require('mongoose')
const Doctor = require('../database/doctorModel')
const Patient = require('../database/patientModel')

const appointmentSchema = new mongoose.Schema({
    appointmentDate:String,
    session:String,
    time:String,
    doctorName: {
        type:mongoose.Schema.Types.ObjectId,
        ref:Doctor,
        required:true
    },
    patientName:{
        type:mongoose.Schema.Types.ObjectId,
        ref:Patient,
        required:true
    },
    appointmentRefid:String,
    appointmentStatus:String,
    appointmentVisibile:Boolean,
    consultationStatus:String
})

const Appointment = mongoose.model('Appointment', appointmentSchema)

module.exports = Appointment