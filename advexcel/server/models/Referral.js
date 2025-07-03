const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
  referralCode: {
    type: String,
    required: true,
    unique: true
  },
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Referral', ReferralSchema);