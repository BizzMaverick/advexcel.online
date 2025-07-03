export const securityHeaders = {
  // Prevent browsers from incorrectly detecting non-scripts as scripts
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent embedding the page in frames
  'X-Frame-Options': 'DENY',
  
  // Enable browser XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Force HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Control how much information is sent in the Referer header
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Control which features and APIs can be used in the browser
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https: wss:",
    "frame-src https://checkout.razorpay.com https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ')
};

export const applySecurityHeaders = (headers: Headers): Headers => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  return headers;
};

export const getCSPNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(Array.isArray(array) ? array : [], byte => byte.toString(16).padStart(2, '0')).join('');
};