import { PaymentDetails } from '../types/subscription';

export class PaymentGateway {
  // Razorpay Integration
  static async initializeRazorpay(paymentDetails: PaymentDetails, userDetails: any) {
    // In production, you would load Razorpay script dynamically
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_1234567890',
          amount: paymentDetails.amount * 100, // Amount in paise
          currency: paymentDetails.currency,
          name: 'Excel Analyzer Pro',
          description: 'Subscription Payment',
          order_id: paymentDetails.orderId,
          prefill: {
            name: userDetails.name || 'User',
            email: userDetails.email || 'user@example.com',
            contact: userDetails.phone || '9999999999'
          },
          theme: {
            color: '#2563EB'
          },
          handler: function (response: any) {
            resolve({
              success: true,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            });
          },
          modal: {
            ondismiss: function () {
              reject(new Error('Payment cancelled by user'));
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.body.appendChild(script);
    });
  }

  // PayU Integration
  static async initializePayU(paymentDetails: PaymentDetails, userDetails: any) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://test.payu.in/_payment'; // Use secure.payu.in for production
    
    const params = {
      key: process.env.REACT_APP_PAYU_KEY || 'test_key_123',
      txnid: paymentDetails.orderId,
      amount: paymentDetails.amount.toString(),
      productinfo: 'Excel Analyzer Pro Subscription',
      firstname: userDetails.name || 'User',
      email: userDetails.email || 'user@example.com',
      phone: userDetails.phone || '9999999999',
      surl: `${window.location.origin}/payment/success`,
      furl: `${window.location.origin}/payment/failure`,
      hash: this.generatePayUHash(paymentDetails, userDetails)
    };

    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  // CCAvenue Integration
  static async initializeCCAvenue(paymentDetails: PaymentDetails, userDetails: any) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction';
    
    const params = {
      merchant_id: process.env.REACT_APP_CCAVENUE_MERCHANT_ID || 'demo_merchant',
      order_id: paymentDetails.orderId,
      amount: paymentDetails.amount.toString(),
      currency: paymentDetails.currency,
      redirect_url: `${window.location.origin}/payment/ccavenue/response`,
      cancel_url: `${window.location.origin}/payment/ccavenue/cancel`,
      billing_name: userDetails.name || 'User',
      billing_email: userDetails.email || 'user@example.com',
      billing_tel: userDetails.phone || '9999999999'
    };

    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  // Stripe Integration (for international payments)
  static async initializeStripe(paymentDetails: PaymentDetails, userDetails: any) {
    // Load Stripe.js
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = async () => {
        const stripe = (window as any).Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
        
        try {
          // Create payment intent on your backend
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: paymentDetails.amount,
              currency: paymentDetails.currency.toLowerCase(),
              orderId: paymentDetails.orderId
            }),
          });
          
          const { clientSecret } = await response.json();
          
          const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: {
                // Card element would be created here
              },
              billing_details: {
                name: userDetails.name,
                email: userDetails.email,
              },
            }
          });

          if (result.error) {
            reject(result.error);
          } else {
            resolve({
              success: true,
              paymentId: result.paymentIntent.id,
              status: result.paymentIntent.status
            });
          }
        } catch (error) {
          reject(error);
        }
      };
      script.onerror = () => reject(new Error('Failed to load Stripe'));
      document.body.appendChild(script);
    });
  }

  // UPI Deep Link Generation
  static generateUPILink(paymentDetails: PaymentDetails, merchantVPA: string = 'merchant@upi') {
    const upiParams = new URLSearchParams({
      pa: merchantVPA,
      pn: 'Excel Analyzer Pro',
      tr: paymentDetails.orderId,
      am: paymentDetails.amount.toString(),
      cu: paymentDetails.currency,
      tn: 'Excel Analyzer Pro Subscription Payment'
    });

    return `upi://pay?${upiParams.toString()}`;
  }

  // QR Code Generation for UPI
  static generateUPIQRCode(paymentDetails: PaymentDetails, merchantVPA: string = 'merchant@upi') {
    const upiLink = this.generateUPILink(paymentDetails, merchantVPA);
    
    // In production, you would use a QR code library like qrcode.js
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
  }

  // Utility function to generate PayU hash
  private static generatePayUHash(paymentDetails: PaymentDetails, userDetails: any): string {
    // In production, this should be generated on your backend for security
    const key = process.env.REACT_APP_PAYU_KEY || 'test_key_123';
    const salt = process.env.REACT_APP_PAYU_SALT || 'test_salt_123';
    
    const hashString = `${key}|${paymentDetails.orderId}|${paymentDetails.amount}|Excel Analyzer Pro Subscription|${userDetails.name || 'User'}|${userDetails.email || 'user@example.com'}|||||||||||${salt}`;
    
    // This is a simplified hash generation - use proper SHA512 in production
    return btoa(hashString);
  }

  // Payment verification
  static async verifyPayment(paymentId: string, orderId: string, gateway: string): Promise<boolean> {
    try {
      // In production, this would call your backend API to verify the payment
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          orderId,
          gateway
        }),
      });

      const result = await response.json();
      return result.verified;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }

  // Get supported payment methods by gateway
  static getSupportedMethods(gateway: string): string[] {
    const methods = {
      razorpay: ['upi', 'card', 'netbanking', 'wallet'],
      payu: ['upi', 'card', 'netbanking', 'wallet'],
      ccavenue: ['card', 'netbanking', 'wallet'],
      stripe: ['card']
    };

    return methods[gateway as keyof typeof methods] || [];
  }

  // Format amount for display
  static formatAmount(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  }
}