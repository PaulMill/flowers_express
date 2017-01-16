'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');

router.get('/recipients', (_req, res, next) => {
  knex('recipients')
    .orderBy('id')
    .then((recipients) => {
      res.send(recipients);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/recipients/:id', (req, res, next) => {
  knex('recipients')
    .where('id', req.params.id)
    .first()
    .then((recipient) => {
      if (!recipient) {
        return next();
      }

      res.send(recipient);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/recipients', (req, res, next) => {
  knex('customers')
    .where('id', req.body.customer_id)
    .first()
    .then((customer) => {
      if (!customer) {
        const err = new Error('customer_id does not exist');

        err.status = 400;

        throw err; // if error goes all the way down to .catch, skips what's between
      }

      return knex('recipients')
        .insert({
          customer_id: req.body.customer_id,
          title: req.body.title,
          likes: req.body.likes
        }, '*');
    })
    .then((recipients) => {
      res.send(recipients[0]);
    })
    .catch((err) => {
      next(err);
    });
});


module.exports = router;