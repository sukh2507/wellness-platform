const mongoose = require('mongoose');
const validator = require('validator');

const sessionSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    default: '',
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  save_file_url: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return validator.isURL(v);
      },
      message: 'Save file URL must be a valid URL'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Index for better query performance
sessionSchema.index({ user_id: 1, status: 1 });
sessionSchema.index({ user_id: 1, created_at: -1 });
sessionSchema.index({ tags: 1 });

// Static method to find sessions by user
sessionSchema.statics.findByUser = function(userId, status = null) {
  const query = { user_id: userId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ created_at: -1 });
};

// Static method to find public sessions
sessionSchema.statics.findPublicSessions = function(limit = 10, skip = 0) {
  return this.find({ status: 'published' })
    .populate('user_id', 'email')
    .sort({ created_at: -1 })
    .limit(limit)
    .skip(skip);
};

// Instance method to check if user owns session
sessionSchema.methods.isOwnedBy = function(userId) {
  return this.user_id.toString() === userId.toString();
};

module.exports = mongoose.model('Session', sessionSchema);