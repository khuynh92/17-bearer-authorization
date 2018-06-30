'use strict';

require('babel-register');

import superr from 'supertest';
import mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose';

const mockgoose = new Mockgoose(mongoose);

const SIGNUP_URI = '/signup';
const SIGNIN_URI = '/signin';
const API_URI = '/api/v1/pizza';

const { server } = require('../../../src/app.js');

const supertest = superr(server);

jest.setTimeout(30000);

beforeAll((done) => {
  mockgoose.prepareStorage().then(function () {
    console.log('preparing mockgoose');
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

describe('api router', () => {
  let user1Token;
  let user2Token;

  beforeEach((done) => {
    let newUser = {
      username: 'username',
      password: 'password',
      email: 'freemail@email.com',
    };

    let newerUser = {
      username: 'nameuser',
      password: 'wordpass',
      email: 'freemail@email.com',
    };

    supertest.post(SIGNUP_URI)
      .send(newUser)
      .then(response => {
        user1Token = response.text;
        supertest.post(SIGNUP_URI)
          .send(newerUser)
          .then(response => {
            user2Token = response.text;
            done();
          });
        done();
      });
  });

  it('get all should return a 200 with an empty array', () => {
    return supertest.get(API_URI)
      .set({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user1Token })
      .then(response => {
        expect(response.text).toEqual('[]');
      });
  });

  it('should get a 401 error if no token is provided', () => {
    return supertest.get(API_URI)
      .then(response => {
        expect(response.status).toBe(401);
        expect(response.text).toBe('ERROR: Invalid User ID/Password');
      });
  });

  it('should get a 200 status with an object for get with an id', () => {
    let pizza = {
      name: 'hawaiian',
      style: 'chicago',
      toppings: 'pineapples, canadian bacon',
    };

    return supertest.post(API_URI)
      .set({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` })
      .send(pizza)
      .then(response => {
        let id = JSON.parse(response.text)._id;
        return supertest.get(`${API_URI}/${id}`)
          .set({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${user1Token}` })
          .then(res => {
            expect(res.status).toBe(200);
            expect(JSON.parse(res.text).name).toBe('hawaiian');
          });
      });

  });

  it('should get a 404 error if id is not found', () => {
    return supertest.get(`${API_URI}/fakepath`)
      .set({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user1Token })
      .then(response => {
        expect(response.status).toBe(404);
      });
  });

  it('get should not allow other users to access data created by other users', () => {
    let pizza = {
      name: 'hawaiian',
      style: 'chicago',
      toppings: 'pineapples, canadian bacon',
    };

    return supertest.post(API_URI)
      .set({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user1Token })
      .send(pizza)
      .then(response => {
        let id = JSON.parse(response.text)._id;
        return supertest.get(API_URI + '/' + id)
          .set({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user2Token })
          .then(res => {
            expect(res.status).toBe(401);
            expect(res.text).toBe('Unauthorized Access');
          });
      });
  });

  it('post should return a 200 for a valid body', () => {
    let pizza = {
      name: 'veggie',
      style: 'deep dish',
      toppings: 'olives, peppers, mushrooms, basil, tomatoes',
    };

    return supertest.post(API_URI)
      .set({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user1Token })
      .send(pizza)
      .then(response => {
        expect(JSON.parse(response.text).name).toBe('veggie');
        expect(response.status).toBe(200);
      });
  });

  it('post should return a 401 if no token was provided', () => {
    let pizza = {
      name: 'veggie',
      style: 'deep dish',
      toppings: 'olives, peppers, mushrooms, basil, tomatoes',
    };

    return supertest.post(API_URI)
      .send(pizza)
      .then(response => {
        expect(response.text).toBe('ERROR: Invalid User ID/Password');
        expect(response.status).toBe(401);
      });
  });

  it('post should return a 400 if no body was provided', () => {
    return supertest.post(API_URI)
      .set({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user1Token })
      .then(response => {
        expect(response.text).toBe('Bad Request, body is needed');
        expect(response.status).toBe(400);
      });
  });

  it('post should not allow basic authentication', () => {
    let pizza = {
      name: 'veggie',
      style: 'deep dish',
      toppings: 'olives, peppers, mushrooms, basil, tomatoes',
    };
    return supertest.post(API_URI)
      .send(pizza)
      .auth('username', 'password')
      .then(response => {
        expect(response.text).toBe('Unauthorized Access');
        expect(response.status).toBe(401);
      });
  });

  it('put should receive a 200 for valid use', () => {
    let pizza = {
      name: 'veggie',
      style: 'deep dish',
      toppings: 'olives, peppers, mushrooms, basil, tomatoes',
    };

    let putObj = {
      style: 'gluten free',
    };

    return supertest.post(API_URI)
      .set({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user1Token })
      .send(pizza)
      .then(response => {
        let id = JSON.parse(response.text)._id;
        expect(JSON.parse(response.text).name).toBe('veggie');
        expect(response.status).toBe(200);
        return supertest.put(`${API_URI}/${id}`)
          .set({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user1Token })
          .send(putObj)
          .then(response => {
            expect(response.status).toBe(200);
            expect(JSON.parse(response.text).style).toBe('gluten free');  
          });
      });
  });

  it('put should return a 401 if no token was provided', () => {
    let pizza = {
      name: 'veggie',
      style: 'deep dish',
      toppings: 'olives, peppers, mushrooms, basil, tomatoes',
    };

    let putObj = {
      style: 'gluten free',
    };

    return supertest.post(API_URI)
      .set({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user1Token })
      .send(pizza)
      .then(response => {
        let id = JSON.parse(response.text)._id;
        expect(JSON.parse(response.text).name).toBe('veggie');
        expect(response.status).toBe(200);
        return supertest.put(`${API_URI}/${id}`)
          .send(putObj)
          .then(response => {
            expect(response.status).toBe(401);
            expect(response.text).toBe('ERROR: Invalid User ID/Password');  
          });
      });
  });

  it('put should receive a 400 for no body', () => {
    let pizza = {
      name: 'veggie',
      style: 'deep dish',
      toppings: 'olives, peppers, mushrooms, basil, tomatoes',
    };

    return supertest.post(API_URI)
      .set({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user1Token })
      .send(pizza)
      .then(response => {
        let id = JSON.parse(response.text)._id;
        expect(JSON.parse(response.text).name).toBe('veggie');
        expect(response.status).toBe(200);
        return supertest.put(`${API_URI}/${id}`)
          .set({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user1Token })
          .then(response => {
            expect(response.status).toBe(400);
            expect(response.text).toBe('Bad Request, body is needed');  
          });
      });
  });

  it('put should receive a 404 for not found id', () => {
    let pizza = {
      name: 'veggie',
      style: 'deep dish',
      toppings: 'olives, peppers, mushrooms, basil, tomatoes',
    };

    let putObj = {
      style: 'gluten free',
    };

    return supertest.post(API_URI)
      .set({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user1Token })
      .send(pizza)
      .then(response => {
        expect(JSON.parse(response.text).name).toBe('veggie');
        expect(response.status).toBe(200);
        return supertest.put(`${API_URI}/oogityboogity`)
          .set({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user1Token })
          .send(putObj)
          .then(response => {
            expect(response.status).toBe(404);
            expect(response.text).toBe('{"error":"Resource Not Found"}');  
          });
      });
  });
});
