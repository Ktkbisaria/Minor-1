const mongoose = require('mongoose');

// User Schema
const userSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    },
    currentUserLatt : {
        type : String,
        default : ""
    },
    currentUserLong : {
        type : String,
        default : ""
    },
    _createdOn : {
        type: Date,
        default : Date.now()
    },
    _carpoolId  : {
        type : String,
        required : true
    },
    _cfc : {
        type : Array,
        required : true
    },
    pFlag : {
        type : Boolean,
        default : false
    }
});



// Carpool Schema
const carpoolSchema = mongoose.Schema({
    cRegNo : {
        type : String,
        required : true
    },
    cModel : {
        type : String,
        required : true
    },
    pFlag : {
        type : Boolean,
        required : true
    }
});

// Carpool Schema
const cfcSchema = mongoose.Schema({
    _score : {
        type : Number,
        required : true
    },
    _givenOn : {
        type: Date,
        default: Date.now()
    }
});

const User = mongoose.model("User", userSchema);
const Carpool = mongoose.model("Carpool", carpoolSchema);
const Cfc = mongoose.model("CFC", cfcSchema);



module.exports = {
    User : User,
    Carpool : Carpool,
    Cfc  : Cfc
}