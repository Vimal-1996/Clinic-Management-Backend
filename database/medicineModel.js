const mongoose = require('mongoose')
const Patient = require('../database/patientModel')
const ObjectId = require('mongodb')

const medicineSchema = new mongoose.Schema({
    medicines:{
        type:[String],
    },
    patientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:Patient
    }
})

const Medicine = mongoose.model('Medicine', medicineSchema)
module.exports = Medicine;