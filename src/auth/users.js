'use strict';

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
});

userSchema.pre('save', function(next) {
  bcrypt.hash(this.password, 10)
    .then(hashed => {
      this.password = hashed;
      next();
    })
    .catch(err => { throw err; });
});


userSchema.statics.authenticate = function(userObj) {
  return this.findOne({username: userObj.username})
    .then(user => user && user.passwordCheck(userObj.password))
    .catch(err => { throw err; });
};

userSchema.statics.authorize = function(token) {
  let user = jwt.verify(token, process.env.APP_SECRET || 'change');
  return this.findOne({_id: user.id})
    .then(user => {
      return user; 
    })
    .catch(err => { throw err; } );
};

userSchema.methods.passwordCheck = function (password) {
  return bcrypt.compare(password, this.password)
    .then(response => {
      return response ? this : null;
    });
};

userSchema.methods.generateToken = function() {
  return jwt.sign({id:this._id}, process.env.APP_SECRET || 'change');
};

export default mongoose.model('User', userSchema);