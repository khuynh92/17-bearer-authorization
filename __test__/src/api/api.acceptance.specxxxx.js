'use strict';

require('babel-register');

import superr from 'supertest';
import mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose';

const mockgoose = new Mockgoose(mongoose);


const API_URI = '/api/v1/pizza';
const SIGNUP_URI = '/signup';
const { server } = require('../../../src/app.js');

const supertest = superr(server);

jest.setTimeout(30000);

afterAll((done) => {
  mongoose.disconnect().then(() => {
    console.log('disconnected');
    done();
  }).catch((err) => {
    console.error(err);
    done();
  });
});

describe('auth module', () => {
  beforeAll((done) => {
    mockgoose.prepareStorage().then(function () {
      mongoose.connect('mongodb://localhost/lab_16').then(() => done());
    });
  });

  afterEach((done) => {
    mockgoose.helper.reset().then(() => {
      done();
    });
  });

  it('get for a 200 should return an empty object for a get all', () => {
    let newUser = {
      username: 'username',
      password: 'password',
      email: 'freemail@email.com',
    };
    return supertest.post(SIGNUP_URI)
      .send(newUser) 
      .then(response => {
        console.log('reunnindkadksadjaskldjaslkdjaslk')
        expect(response.status).toBe(200);
        expect(response.text).toBeDefined();
      });
    
  });

});