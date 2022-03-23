﻿const mongoose = require('mongoose');

const user_photo_schema = new mongoose.Schema({
    UserId: {type: String, required: true},
    photo: {type: String, required: true},
    isProfilePhoto: Boolean
});

module.exports.User_Photo = mongoose.model('User_Photo', user_photo_schema);