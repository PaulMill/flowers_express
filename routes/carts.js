'use strict';

const boom = require('boom');
const express = require('express');
const jwt = require('jsonwebtoken');
const knex = require('../knex');

// eslint-disable-next-line new-cap
const router = express.Router();

const authorize = function(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return next(boom.create(401, 'Unauthorized'));
    }

    req.claim = payload;

    next();
  });
};

router.get('/cart', (req, res, next) => {
  console.log(req.claim);
  knex('carts')
    .innerJoin('flowers', 'flowers.id', 'carts.flower_id')
    .where('carts.customer_id', req.claim.customer_id)
    .orderBy('id', 'ASC')
    .then((rows) => {
      const cart = rows;

      res.send(cart);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/cart', (req, res, next) => {
  const flower_id = req.body.id;
  const price = req.body.price;
  const customer_id = req.body.customer_id;

  if (!flower_id || !flower_id.trim()) {
    return next(boom.create(400, 'Flower ID must be exist'));
  }
  if (!price || !price.trim()) {
    return next(boom.create(400, 'Price must be exist'));
  }

  const insertFlower = { flower_id, price, customer_id };
  console.log(insertFlower);
  knex('carts')
    .insert((insertFlower), '*')
    .then((flower) => {
      res.send(flower[0]);
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/cart/:id', (req, res, next) => {
  const id = Number.parseInt(req.params.id);

  if (!id) {
    return next();
  }
  knex('carts')
    .del('*')
    .where('id', id)
    .then((flowers) => {
      const deletedFlower = flowers[0];

      if (!deletedFlower) {
        return next();
      }
      delete deletedFlower.id;
      res.send(deletedFlower);
    })
    .catch((err) => {
      next(err);
    });
});


module.exports = router;
