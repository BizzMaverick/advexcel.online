import { AuditService } from './auditService';
import { SecurityService } from './securityService';

interface SMSResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

export class SMSService {
  private static readonly TWILIO_ACCOUNT_SID = process.env.VITE_TWILIO_ACCOUNT_SID || 'AC00000000000000000000000000000000';
  private static readonly TWILIO_AUTH_TOKEN = process.env.VITE_TWILIO_AUTH_TOKEN || 'your_auth_token';
  private static readonly TWILIO_PHONE_NUMBER = process.env.VITE_TWILIO_PHONE_NUMBER || '+15005550006';
  private static readonly SMS_API_URL = 'https://api.twilio.com/2010-04-01/Accounts';
  
  // For demo/development, store sent messages
  private static sentMessages: Map<string, { otp: string, timestamp: number }> = new Map();

  static async sendOTP(phoneNumber: string, otp: string): Promise<SMSResponse> {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      // Rate limiting check
      const canSend = this.checkRateLimit(phoneNumber);
      if (!canSend) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Prepare message
      const message = `Your Excel Pro AI verification code is: ${otp}. This code will expire in 5 minutes.`;
      
      // In production, this would call the Twilio API
      // For demo purposes, we'll simulate the API call
      const response = await this.simulateSendSMS(phoneNumber, message);
      
      // Store the OTP for demo purposes
      this.sentMessages.set(phoneNumber, { otp, timestamp: Date.now() });
      
      // Log the SMS sending (for audit)
      await AuditService.log({
        action: 'sms_otp_sent',
        resource: 'auth',
        details: { phoneNumber, messageId: response.messageId },
        ipAddress: '127.0.0.1',
        success: true
      });

      return response;
    } catch (error) {
      console.error('SMS sending error:', error);
      
      // Log the failure
      await AuditService.log({
        action: 'sms_otp_failed',
        resource: 'auth',
        details: { phoneNumber, error: error instanceof Error ? error.message : 'Unknown error' },
        ipAddress: '127.0.0.1',
        success: false
      });

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send SMS'
      };
    }
  }

  // Helper methods
  private static isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic validation - in production use a proper library like libphonenumber-js
    return /^\+[1-9]\d{1,14}$/.test(phoneNumber);
  }

  private static checkRateLimit(phoneNumber: string): boolean {
    // In production, implement proper rate limiting
    // For demo, we'll allow unlimited messages
    return true;
  }

  private static async simulateSendSMS(phoneNumber: string, message: string): Promise<SMSResponse> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Log the message for demo purposes
    console.log(`[SMS SENT TO ${phoneNumber}]: ${message}`);
    
    // Generate a fake message ID
    const messageId = 'SM' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    
    return {
      success: true,
      message: 'SMS sent successfully',
      messageId
    };
  }

  // In production, this would be the actual Twilio API call
  private static async sendSMSViaTwilio(phoneNumber: string, message: string): Promise<SMSResponse> {
    try {
      const url = `${this.SMS_API_URL}/${this.TWILIO_ACCOUNT_SID}/Messages.json`;
      
      const formData = new URLSearchParams();
      formData.append('To', phoneNumber);
      formData.append('From', this.TWILIO_PHONE_NUMBER);
      formData.append('Body', message);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${this.TWILIO_ACCOUNT_SID}:${this.TWILIO_AUTH_TOKEN}`)
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send SMS');
      }
      
      return {
        success: true,
        message: 'SMS sent successfully',
        messageId: data.sid
      };
    } catch (error) {
      console.error('Twilio API error:', error);
      throw error;
    }
  }

  // For testing and development
  static getLastSentOTP(phoneNumber: string): string | null {
    const storedData = this.sentMessages.get(phoneNumber);
    return storedData ? storedData.otp : null;
  }

  static clearSentMessages(): void {
    this.sentMessages.clear();
  }
}