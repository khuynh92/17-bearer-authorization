'use strict';

require('babel-register');

import superr from 'supertest';
import mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose';

const mockgoose = new Mockgoose(mongoose);

const SIGNUP_URI = '/signup';
const SIGNIN_URI = '/signin';

const { server } = require('../../../src/app.js');

const supertest = superr(server);

jest.setTimeout(30000);

beforeAll((done) => {
  mockgoose.prepareStorage().then(function () {
    console.log('before all');
    mongoose.connect('mongodb://localhost/lab_16').then(() => done());
  });
});

afterAll((done) => {
  mongoose.disconnect().then(() => {
    console.log('disconnected');
    done();
  }).catch((err) => {
    console.error(err);
    done();
  });
});
afterEach((done) => {
  console.log('resetting');
  mockgoose.helper.reset().then(() => {
    done();
  });
});

describe('auth module', () => {

  it('get should return 200 for homepage', () => {

    return supertest.get('/')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.text).toEqual(expect.stringContaining('Username'));
      });
  });

  it('should return a 404 if a route is not found', () => {

    return supertest.get('/fakepath')
      .then(response => {
        expect(response.statusCode).toBe(404);
        expect(response.text).toEqual('{"error":"Resource Not Found"}');
      });
  });

  it('signin gets a 401 on a bad login', () => {

    return supertest.get(SIGNIN_URI)
      .then(response => {
        expect(response.text).toEqual('ERROR: Invalid User ID/Password');
        expect(response.status).toBe(401);
        console.log(response.statusCode);
      });

  });

  it('signin gets a 200 on a good login', () => {
    let newUser = {
      username: 'khoa',
      password: 'test',
      email: 'email@email.com',
    };

    return supertest.post(SIGNUP_URI)
      .send(newUser)
      .then(() => {
        return supertest.get(SIGNIN_URI)
          .auth('khoa', 'test')
          .then(res => {
            expect(res.statusCode).toEqual(200);
          });
      });
  });

  it('signup posts should return a 200 if for good posts', () => {
    let newUser = {
      username: 'Darcy',
      password: 'Password',
      email: 'freemail@email.com',
    };

    return supertest.post(SIGNUP_URI)
      .send(newUser) 
      .then(response => {
        expect(response.status).toBe(200);
        expect(response.text).toBeDefined();
      });
    
  });

  it('signup posts should return a 400 for a bad body', () => {
    return supertest.post(SIGNUP_URI) 
      .then(response => {
        expect(response.status).toBe(400);
        expect(response.text).toBe('Bad Request, body is needed');
      });
  });

});

