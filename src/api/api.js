'use strict';
import express from 'express';
import fs from 'fs';
const router = express.Router();
import Pizza from './pizza.js';
import auth from '../auth/auth.js';

router.get('/', (req, res) => {
  res.statusCode = 200;
  res.statusMessage = 'OK';

  fs.readFile(__dirname + '/../../public/index.html', (err, data) => {
    if (err) { throw err; }
    res.write(data);
    res.end();
  });
});

router.post('/api/v1/pizza', auth, (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    next(400);
  }
  if (req.id) {
    let pizza = new Pizza(req.body);
    pizza.userID = req.id;
    pizza.save()
      .then(response => {
        res.send(response);
      })
      .catch(next);
  } else {
    next('Unauthorized');
  }
});

router.get('/api/v1/pizza', auth, (req, res, next) => {
  if (req.id) {
    Pizza.find({ userID: req.id })
      .then(response => {
        res.send(response);
      })
      .catch(next);
  } else {
    next('Unauthorized');
  }
});

router.get('/api/v1/pizza/:id', auth, (req, res, next) => {
  if (req.id) {
    Pizza.findById(req.params.id)
      .then(response => {
        if(response === null) {
          next();
        }
        if (JSON.stringify(response.userID) === JSON.stringify(req.id)) {
          res.send(response);
        } else {
          next('Unauthorized');
        }
      })
      .catch(() =>{
        next();
      });
  } else {
    next('Unauthorized');
  }
});

router.put('/api/v1/pizza/:id', auth, (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    next(400);
  }
  if (req.id) {
    Pizza.findById(req.params.id)
      .then(response => {
        if(response === null) {
          next();
        }
        if(JSON.stringify(response.userID) === JSON.stringify(req.id)) {
          Pizza.findByIdAndUpdate(req.params.id, req.body, {new: true})
            .then(data => {
              res.send(data);
            })
            .catch(next);
        } else {
          next('Unauthorized');
        }
      })
      .catch(() => {
        next();
      });
  } else {
    next('Unauthorized');
  }
});

router.delete('/api/v1/pizza/:id', auth, (req,res,next) => {
  if (req.id) {
    Pizza.findById(req.params.id)
      .then(data => {
        if(data === null) {
          next();
        } else {
          if(JSON.stringify(req.id) === JSON.stringify(data.userID)) {
            Pizza.findByIdAndRemove(req.params.id)
              .then((() => {
                let removed = `${req.params.id} has been removed`;
                res.send(removed);  
              }))
              .catch(next);
          } else {
            next('Unauthorized');
          }
        }
      })
      .catch(() => {
        next();
      });
  } else {
    next('Unauthorized');
  }
});

export default router;
