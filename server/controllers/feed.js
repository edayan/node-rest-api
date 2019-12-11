const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const count = await Post.find().countDocuments();
    let totalItems = count;
    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    return res.status(200).json({
      message: 'posts succesfully fetched',
      posts: posts,
      totalItems: totalItems
    });
  } catch (err) {
    handleError(err, next);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error('No image provided');
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId
  });

  try {
    const result = await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    const savedUSer = await user.save();
    res.status(201).json({
      message: 'Post created successfully!',
      post: post,
      creator: {
        id: savedUSer._id,
        name: savedUSer.name
      }
    });
  } catch (err) {
    handleError(err, next);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Could not find post with id' + postId);
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: 'Post fetched',
      post: post
    });
  } catch (err) {
    handleError(err, next);
  }
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error('No file picked for post with id' + postId);
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post with id' + postId);
        error.statusCode = 404;
        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error(
          'cannot update ' + postId + ' as not authorized'
        );
        error.statusCode = 403;
        throw error;
      }

      if (imageUrl !== post.imageUrl) {
        this.clearImage(post.imageUrl);
      }

      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then(result => {
      res
        .status(200)
        .json({ message: 'Post updated successfully', post: result });
    })
    .catch(err => {
      handleError(err, next);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post with id' + postId);
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error(
          'cannot delete ' + postId + ' as not authorized'
        );
        error.statusCode = 403;
        throw error;
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Deleted post with id:' + postId });
    })
    .catch(err => {
      handleError(err, next);
    });
};

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};

handleError = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};
