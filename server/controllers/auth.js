const User = require('../models/user');
const bcrypt = require('bcryptjs');

const { validationResult } = require('express-validator');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  bcrypt
    .hash(password, 12)
    .then(hashPw => {
      const user = new User({
        email: email,
        name: name,
        password: hashPw
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({ message: 'User created', userId: result._id });
    })
    .catch(err => {
      handelError(err, next);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error('authentication failed');
        error.status = 404;
        throw error;
      }

      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('authentication failed');
        error.status = 401;
        throw error;
      }

      
    })
    .catch(err => {
      handelError(err, next);
    });
};

handleError = (error, next) => {
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  next(error);
};
