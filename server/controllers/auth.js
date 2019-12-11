const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
      handleError(err, next);
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

      const token = jwt.sign(
        { email: loadedUser.email, userId: loadedUser._id.toString() },
        'somesupersecret',
        { expiresIn: '1h' }
      );

      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch(err => {
      handleError(err, next);
    });
};

exports.getUserStatus = (req, res, next) => {
  User.findById(req.userId)
    .then(user => {
      if (!user) {
        const error = new Error('user not found');
        error.status = 401;
        throw error;
      }

      return res.status(200).json({ status: user.status });
    })
    .catch(err => {
      handleError(err, next);
    });
};

exports.updateUserStatus = (req, res, next) => {
  const newStatus = req.body.status;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  User.findById(req.userId)
    .then(user => {
      if (!user) {
        const error = new Error('user not found');
        error.status = 401;
        throw error;
      }
      user.status = newStatus;
      return user.save();
    })
    .then(user => {
      return res.status(200).json({ status: user.status });
    })
    .catch(err => {
      handleError(err, next);
    });
};
handleError = (error, next) => {
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  next(error);
};
