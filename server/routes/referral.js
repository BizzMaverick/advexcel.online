const express = require('express');
const Referral = require('../models/Referral');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Generate a referral code
router.post('/generate', auth, async (req, res) => {
  try {
    // Check if user already has an active referral code
    const existingReferral = await Referral.findOne({
      referrer: req.user._id,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (existingReferral) {
      return res.json({
        success: true,
        referral: existingReferral
      });
    }
    
    // Generate a new referral code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referralCode = '';
    for (let i = 0; i < 8; i++) {
      referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Set expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Create new referral
    const referral = new Referral({
      referralCode,
      referrer: req.user._id,
      expiresAt
    });
    
    await referral.save();
    
    res.status(201).json({
      success: true,
      referral
    });
  } catch (error) {
    console.error('Generate referral error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's referral codes
router.get('/my-referrals', auth, async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate('usedBy', 'email firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      referrals
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Validate a referral code
router.post('/validate', async (req, res) => {
  try {
    const { referralCode } = req.body;
    
    if (!referralCode) {
      return res.status(400).json({ success: false, message: 'Referral code is required' });
    }
    
    const referral = await Referral.findOne({
      referralCode,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!referral) {
      return res.status(400).json({ success: false, message: 'Invalid or expired referral code' });
    }
    
    res.json({
      success: true,
      message: 'Valid referral code',
      referralId: referral._id
    });
  } catch (error) {
    console.error('Validate referral error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Apply a referral code during registration
router.post('/apply', auth, async (req, res) => {
  try {
    const { referralCode } = req.body;
    
    if (!referralCode) {
      return res.status(400).json({ success: false, message: 'Referral code is required' });
    }
    
    // Find the referral
    const referral = await Referral.findOne({
      referralCode,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!referral) {
      return res.status(400).json({ success: false, message: 'Invalid or expired referral code' });
    }
    
    // Make sure user is not referring themselves
    if (referral.referrer.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot use your own referral code' });
    }
    
    // Mark referral as used
    referral.isUsed = true;
    referral.usedBy = req.user._id;
    await referral.save();
    
    // Add bonus days to referrer's subscription
    const referrer = await User.findById(referral.referrer);
    if (referrer && referrer.subscription) {
      // Add 7 days to referrer's subscription
      const endDate = new Date(referrer.subscription.endDate);
      endDate.setDate(endDate.getDate() + 7);
      referrer.subscription.endDate = endDate;
      
      if (!referrer.subscription.isActive) {
        referrer.subscription.isActive = true;
        referrer.subscription.startDate = new Date();
      }
      
      await referrer.save();
    }
    
    // Add bonus days to current user's subscription
    const user = await User.findById(req.user._id);
    if (user && user.subscription) {
      // Add 3 days to user's subscription
      const endDate = new Date(user.subscription.endDate);
      endDate.setDate(endDate.getDate() + 3);
      user.subscription.endDate = endDate;
      await user.save();
    }
    
    res.json({
      success: true,
      message: 'Referral code applied successfully. You and your referrer both received bonus days!'
    });
  } catch (error) {
    console.error('Apply referral error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;