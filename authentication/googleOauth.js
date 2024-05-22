const GoogleStrategy = require('passport-google-oauth20').Strategy
const Google_client_id = process.env.GOOGLE_CLIENT_ID
const Google_client_secret = process.env.GOOGLE_CLIENT_SECRET

module.exports = function(passport) {
    const userModel = require('../database/userModel')
    passport.use(new GoogleStrategy({
        clientID: "893491366362-r6h8m46v3r4gb0bbdm72qi5bjh68jqtm.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: "http://localhost:5000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await userModel.findOne({ email: profile.emails[0].value });
          if (existingUser) {
            return done(null, existingUser);
          }
          const newUser = new userModel({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          });
          await newUser.save();
          done(null, newUser);
        } catch (error) {
          done(error, null);
        }
      }
    ));
  
    passport.serializeUser((user, done) => {
      done(null, user.googleId);
    });
  
    passport.deserializeUser(async (id, done) => {
      try {
        const user = await userModel.findOne({googleId:id})
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });
  };




