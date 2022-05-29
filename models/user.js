const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({ //define User any way we like
    email: {
        type: String,
        required: true,
        unique: true
    }
});
UserSchema.plugin(passportLocalMongoose); //passport can be bad because the inner details are hidden
//passport-local-mongoose will add a username, hash and salt field to store the username, the hashed password and the salt value

module.exports = mongoose.model('User', UserSchema);