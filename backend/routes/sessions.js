const express = require('express');
const validator = require('validator'); 
const Session = require('../models/Session');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateSession, validateObjectId } = require('../middleware/validation');
const router = express.Router();

// GET /sessions - Get public wellness sessions
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 per page
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const tags = req.query.tags;

    // Build query for public sessions
    let query = { status: 'published' };

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Add tag filtering
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }

    // Get public sessions with population
    const sessions = await Session.find(query)
      .populate('user_id', 'email')
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const totalSessions = await Session.countDocuments(query);
    const totalPages = Math.ceil(totalSessions / limit);

    res.status(200).json({
      success: true,
      data: {
        sessions,
        pagination: {
          currentPage: page,
          totalPages,
          totalSessions,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get public sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /my-sessions - Get user's own sessions (draft + published)
router.get('/my-sessions', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;

    // Build query for user's sessions
    let query = { user_id: req.user.id };

    // Filter by status if provided
    if (status && ['draft', 'published'].includes(status)) {
      query.status = status;
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const sessions = await Session.find(query)
      .sort({ updated_at: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const totalSessions = await Session.countDocuments(query);
    const totalPages = Math.ceil(totalSessions / limit);

    // Get session counts by status
    const draftCount = await Session.countDocuments({ user_id: req.user.id, status: 'draft' });
    const publishedCount = await Session.countDocuments({ user_id: req.user.id, status: 'published' });

    res.status(200).json({
      success: true,
      data: {
        sessions,
        pagination: {
          currentPage: page,
          totalPages,
          totalSessions,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        },
        summary: {
          total: draftCount + publishedCount,
          draft: draftCount,
          published: publishedCount
        }
      }
    });

  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ADD THIS NEW ROUTE - GET /my-sessions/:id - Get single user session for editing
router.get('/my-sessions/:id', validateObjectId('id'), authenticateToken, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user owns the session
    if (!session.isOwnedBy(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this session'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        session: session.toObject()
      }
    });

  } catch (error) {
    console.error('Get user session for editing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /sessions/:id - View a single session (public or owner)
router.get('/:id', validateObjectId('id'), optionalAuth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('user_id', 'email');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check access permissions
    const isOwner = req.user && session.isOwnedBy(req.user.id);
    const isPublished = session.status === 'published';

    if (!isOwner && !isPublished) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this session'
      });
    }

    // Don't expose user_id for public sessions unless it's the owner viewing
    const sessionData = session.toObject();
    if (!isOwner) {
      sessionData.user_id = { email: sessionData.user_id.email };
    }

    res.status(200).json({
      success: true,
      data: {
        session: sessionData,
        isOwner
      }
    });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /my-sessions/save-draft - Save or update a draft session
router.post('/my-sessions/save-draft', authenticateToken, validateSession, async (req, res) => {
  try {
    const { title, content, tags, save_file_url } = req.body;

    const sessionData = {
      user_id: req.user.id,
      title: title.trim(),
      content: content ? content.trim() : '',
      tags: tags ? tags.map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
      save_file_url: save_file_url || null,
      status: 'draft'
    };

    const session = new Session(sessionData);
    await session.save();

    res.status(201).json({
      success: true,
      message: 'Draft session saved successfully',
      data: {
        session
      }
    });

  } catch (error) {
    console.error('Save draft session error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to save draft session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /my-sessions/publish - Save and publish a session
router.post('/my-sessions/publish', authenticateToken, validateSession, async (req, res) => {
  try {
    const { title, content, tags, save_file_url } = req.body;

    // Additional validation for published sessions
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for published sessions'
      });
    }

    const sessionData = {
      user_id: req.user.id,
      title: title.trim(),
      content: content.trim(),
      tags: tags ? tags.map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
      save_file_url: save_file_url || null,
      status: 'published'
    };

    const session = new Session(sessionData);
    await session.save();

    res.status(201).json({
      success: true,
      message: 'Session published successfully',
      data: {
        session
      }
    });

  } catch (error) {
    console.error('Publish session error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to publish session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /my-sessions/:id - Update an existing session
router.put('/my-sessions/:id', validateObjectId('id'), authenticateToken, validateSession, async (req, res) => {
  try {
    const { title, content, tags, save_file_url, status } = req.body;

    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user owns the session
    if (!session.isOwnedBy(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this session'
      });
    }

    // Additional validation for published sessions
    if (status === 'published' && (!content || content.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for published sessions'
      });
    }

    // Update session fields
    session.title = title.trim();
    session.content = content ? content.trim() : '';
    session.tags = tags ? tags.map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
    session.save_file_url = save_file_url || null;
    
    if (status && ['draft', 'published'].includes(status)) {
      session.status = status;
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: {
        session
      }
    });

  } catch (error) {
    console.error('Update session error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /my-sessions/:id - Delete a session
router.delete('/my-sessions/:id', validateObjectId('id'), authenticateToken, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user owns the session
    if (!session.isOwnedBy(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this session'
      });
    }

    await Session.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
      data: {
        deletedSession: {
          _id: session._id,
          title: session.title,
          status: session.status
        }
      }
    });

  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /my-sessions/:id/publish - Publish a draft session
router.put('/my-sessions/:id/publish', validateObjectId('id'), authenticateToken, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user owns the session
    if (!session.isOwnedBy(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this session'
      });
    }

    // Check if session is already published
    if (session.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Session is already published'
      });
    }

    // Validate content exists for publishing
    if (!session.content || session.content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required to publish a session'
      });
    }

    session.status = 'published';
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session published successfully',
      data: {
        session
      }
    });

  } catch (error) {
    console.error('Publish session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /my-sessions/:id/unpublish - Unpublish a session (make it draft)
router.put('/my-sessions/:id/unpublish', validateObjectId('id'), authenticateToken, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user owns the session
    if (!session.isOwnedBy(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this session'
      });
    }

    // Check if session is already a draft
    if (session.status === 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Session is already a draft'
      });
    }

    session.status = 'draft';
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session unpublished successfully',
      data: {
        session
      }
    });

  } catch (error) {
    console.error('Unpublish session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unpublish session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /my-sessions/stats - Get user's session statistics
router.get('/my-sessions/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get counts by status
    const [draftCount, publishedCount, totalSessions] = await Promise.all([
      Session.countDocuments({ user_id: userId, status: 'draft' }),
      Session.countDocuments({ user_id: userId, status: 'published' }),
      Session.find({ user_id: userId }).lean()
    ]);

    // Calculate additional stats
    const recentSessions = totalSessions
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5);

    // Get most used tags
    const allTags = totalSessions.reduce((tags, session) => {
      return tags.concat(session.tags || []);
    }, []);

    const tagCounts = allTags.reduce((counts, tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
      return counts;
    }, {});

    const mostUsedTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total: draftCount + publishedCount,
          draft: draftCount,
          published: publishedCount
        },
        recentSessions: recentSessions.map(session => ({
          _id: session._id,
          title: session.title,
          status: session.status,
          updated_at: session.updated_at
        })),
        mostUsedTags,
        totalTags: Object.keys(tagCounts).length
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /sessions/search - Advanced search for public sessions
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q: query, tags, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    let searchQuery = { status: 'published' };

    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ];
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      searchQuery.tags = { $in: tagArray.map(tag => tag.trim()) };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute search
    const [sessions, totalCount] = await Promise.all([
      Session.find(searchQuery)
        .populate('user_id', 'email')
        .sort(sortObj)
        .limit(limitNum)
        .skip(skip)
        .lean(),
      Session.countDocuments(searchQuery)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      data: {
        sessions,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum
        },
        searchQuery: {
          query,
          tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : null,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Search sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /sessions/tags - Get all available tags from published sessions
router.get('/tags', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    // Aggregate tags from published sessions
    const tagStats = await Session.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { tag: '$_id', count: 1, _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        tags: tagStats,
        totalUniqueTags: tagStats.length
      }
    });

  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,   
      message: 'Failed to fetch tags',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }); 
  }
});

module.exports = router;