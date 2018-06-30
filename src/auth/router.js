'use strict';

import express from 'express';

const authRouter = express.Router();

import User from './users.js';
import auth from './auth.js';

authRouter.post('/signup', (req, res, next) => {
  if(!Object.keys(req.body).length) {
    next(400);
  }
  let user = new User(req.body);
  user.save()
    .then(user => {
      res.send(user.generateToken());
    })
    .catch(next);
});

authRouter.get('/signin', auth, (req, res) => {
  res.cookie('Token', req.token);
  res.send(req.token);
});

export default authRouter;
