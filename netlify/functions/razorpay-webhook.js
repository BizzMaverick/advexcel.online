const crypto = require('crypto');
const { AuthService } = require('../utils/authService');

exports.handler = async function (event) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = event.headers['x-razorpay-signature'];
  const body = event.body;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    return { statusCode: 400, body: 'Invalid signature' };
  }

  const payload = JSON.parse(body);
  const email = payload.payload?.payment?.entity?.email;

  if (email) {
    await AuthService.grantSubscription(email); // You define this
  }

  return { statusCode: 200, body: 'Webhook received' };
};
