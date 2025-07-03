const express = require('express');
const Spreadsheet = require('../models/Spreadsheet');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all spreadsheets for a user
router.get('/', auth, async (req, res) => {
  try {
    const spreadsheets = await Spreadsheet.find({ user: req.user._id })
      .select('name format isPublic createdAt lastModified')
      .sort({ lastModified: -1 });
    
    res.json({
      success: true,
      spreadsheets
    });
  } catch (error) {
    console.error('Get spreadsheets error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get a specific spreadsheet
router.get('/:id', auth, async (req, res) => {
  try {
    const spreadsheet = await Spreadsheet.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!spreadsheet) {
      return res.status(404).json({ success: false, message: 'Spreadsheet not found' });
    }
    
    res.json({
      success: true,
      spreadsheet
    });
  } catch (error) {
    console.error('Get spreadsheet error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new spreadsheet
router.post('/', auth, async (req, res) => {
  try {
    const { name, data, format } = req.body;
    
    if (!name || !data) {
      return res.status(400).json({ success: false, message: 'Name and data are required' });
    }
    
    const spreadsheet = new Spreadsheet({
      name,
      user: req.user._id,
      data,
      format: format || 'xlsx'
    });
    
    await spreadsheet.save();
    
    res.status(201).json({
      success: true,
      spreadsheet: {
        id: spreadsheet._id,
        name: spreadsheet.name,
        format: spreadsheet.format,
        isPublic: spreadsheet.isPublic,
        createdAt: spreadsheet.createdAt,
        lastModified: spreadsheet.lastModified
      }
    });
  } catch (error) {
    console.error('Create spreadsheet error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a spreadsheet
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, data, isPublic } = req.body;
    
    const spreadsheet = await Spreadsheet.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!spreadsheet) {
      return res.status(404).json({ success: false, message: 'Spreadsheet not found' });
    }
    
    if (name) spreadsheet.name = name;
    if (data) spreadsheet.data = data;
    if (isPublic !== undefined) spreadsheet.isPublic = isPublic;
    
    spreadsheet.lastModified = Date.now();
    await spreadsheet.save();
    
    res.json({
      success: true,
      spreadsheet: {
        id: spreadsheet._id,
        name: spreadsheet.name,
        format: spreadsheet.format,
        isPublic: spreadsheet.isPublic,
        createdAt: spreadsheet.createdAt,
        lastModified: spreadsheet.lastModified
      }
    });
  } catch (error) {
    console.error('Update spreadsheet error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a spreadsheet
router.delete('/:id', auth, async (req, res) => {
  try {
    const spreadsheet = await Spreadsheet.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!spreadsheet) {
      return res.status(404).json({ success: false, message: 'Spreadsheet not found' });
    }
    
    res.json({
      success: true,
      message: 'Spreadsheet deleted successfully'
    });
  } catch (error) {
    console.error('Delete spreadsheet error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Share a spreadsheet (make it public or private)
router.put('/:id/share', auth, async (req, res) => {
  try {
    const { isPublic } = req.body;
    
    if (isPublic === undefined) {
      return res.status(400).json({ success: false, message: 'isPublic field is required' });
    }
    
    const spreadsheet = await Spreadsheet.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!spreadsheet) {
      return res.status(404).json({ success: false, message: 'Spreadsheet not found' });
    }
    
    spreadsheet.isPublic = isPublic;
    await spreadsheet.save();
    
    res.json({
      success: true,
      message: isPublic ? 'Spreadsheet is now public' : 'Spreadsheet is now private',
      isPublic
    });
  } catch (error) {
    console.error('Share spreadsheet error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get a public spreadsheet
router.get('/public/:id', async (req, res) => {
  try {
    const spreadsheet = await Spreadsheet.findOne({
      _id: req.params.id,
      isPublic: true
    }).select('name data format createdAt lastModified');
    
    if (!spreadsheet) {
      return res.status(404).json({ success: false, message: 'Spreadsheet not found or not public' });
    }
    
    res.json({
      success: true,
      spreadsheet
    });
  } catch (error) {
    console.error('Get public spreadsheet error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;