const validator = require('validator');

// Validation middleware for user registration
const validateRegistration = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  } else if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for user login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for session creation/update
const validateSession = (req, res, next) => {
  const { title, content, tags, status } = req.body;
  const errors = [];

  // Title validation
  if (!title) {
    errors.push('Session title is required');
  } else if (title.length > 200) {
    errors.push('Title cannot exceed 200 characters');
  }

  // Content validation (optional)
  if (content && content.length > 10000) {
    errors.push('Content cannot exceed 10000 characters');
  }

  // Tags validation (optional)
  if (tags) {
    if (!Array.isArray(tags)) {
      errors.push('Tags must be an array');
    } else {
      tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push(`Tag at index ${index} must be a string`);
        } else if (tag.length > 50) {
          errors.push(`Tag at index ${index} cannot exceed 50 characters`);
        }
      });
    }
  }

  // Status validation (optional)
  if (status && !['draft', 'published'].includes(status)) {
    errors.push('Status must be either "draft" or "published"');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for MongoDB ObjectId
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !validator.isMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }

    next();
  };
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateSession,
  validateObjectId
};