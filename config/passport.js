const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const passport = require('passport');
const User = require('../models/user');

// ;

const createPassportConfig = async () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    }, async (accessToken, refreshToken, profile, cb) => {
        console.log(profile)
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name?.familyName || 'test',
            image: profile.photos[0].value
        }
        try {
            let user = await User.findOne({googleId:profile.id})
            if(user){
                cb(null,user)
            }else{
                user = await User.create(newUser)
                cb(null,user)
            }
        } catch (error) {
            console.log(error)
        }
    }))

    passport.serializeUser((user, callback) => {
        callback(null, user.id)
    })

    passport.deserializeUser((id, callback) => {
        User.findById(id).then((user)=>{
            callback(null,user)
        }).catch((err)=>{
            callback(err)
        })
        // User.findById({id}, (err, user) => {
        //     callback(err, user)
        // })
    })
}

module.exports = { createPassportConfig };


