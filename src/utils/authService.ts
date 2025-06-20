import { DeviceService } from './deviceService';

export class AuthService {
  private static readonly API_BASE = 'https://api.excelanalyzerpro.com'; // Replace with your actual API
  
  static async sendOTP(identifier: string, type: 'email' | 'phone'): Promise<{ success: boolean; message: string }> {
    try {
      // For demo purposes, we'll use a mock service
      // In production, replace this with your actual OTP service
      
      if (type === 'email') {
        return await this.sendEmailOTP(identifier);
      } else {
        return await this.sendSMSOTP(identifier);
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  private static async sendEmailOTP(email: string): Promise<{ success: boolean; message: string }> {
    // For demo purposes, we'll simulate sending an email OTP
    // In production, integrate with services like SendGrid, AWS SES, etc.
    
    const otp = this.generateOTP();
    
    // Store OTP temporarily (in production, use secure backend storage)
    localStorage.setItem(`otp_${email}`, JSON.stringify({
      otp,
      timestamp: Date.now(),
      attempts: 0
    }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo, show the OTP in console (remove in production)
    console.log(`OTP for ${email}: ${otp}`);
    
    return {
      success: true,
      message: `OTP sent to ${email}. Check your inbox and spam folder.`
    };
  }

  private static async sendSMSOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    // For demo purposes, we'll simulate sending an SMS OTP
    // In production, integrate with services like Twilio, AWS SNS, etc.
    
    const otp = this.generateOTP();
    
    // Store OTP temporarily (in production, use secure backend storage)
    localStorage.setItem(`otp_${phoneNumber}`, JSON.stringify({
      otp,
      timestamp: Date.now(),
      attempts: 0
    }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo, show the OTP in console (remove in production)
    console.log(`OTP for ${phoneNumber}: ${otp}`);
    
    return {
      success: true,
      message: `OTP sent to ${phoneNumber} via SMS.`
    };
  }

  static verifyOTP(identifier: string, enteredOTP: string): { success: boolean; message: string } {
    const storedData = localStorage.getItem(`otp_${identifier}`);
    
    if (!storedData) {
      return {
        success: false,
        message: 'No OTP found. Please request a new one.'
      };
    }

    const { otp, timestamp, attempts } = JSON.parse(storedData);
    
    // Check if OTP is expired (5 minutes)
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      localStorage.removeItem(`otp_${identifier}`);
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.'
      };
    }

    // Check attempts limit
    if (attempts >= 3) {
      localStorage.removeItem(`otp_${identifier}`);
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      };
    }

    if (enteredOTP === otp) {
      localStorage.removeItem(`otp_${identifier}`);
      return {
        success: true,
        message: 'OTP verified successfully!'
      };
    } else {
      // Increment attempts
      localStorage.setItem(`otp_${identifier}`, JSON.stringify({
        otp,
        timestamp,
        attempts: attempts + 1
      }));
      
      return {
        success: false,
        message: `Invalid OTP. ${2 - attempts} attempts remaining.`
      };
    }
  }

  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async authenticateUser(identifier: string, password: string): Promise<{ success: boolean; user?: any; message: string }> {
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, accept any password with length >= 6
    if (password.length >= 6) {
      const user = {
        id: Date.now().toString(),
        email: identifier.includes('@') ? identifier : undefined,
        phoneNumber: !identifier.includes('@') ? identifier : undefined,
        isVerified: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      return {
        success: true,
        user,
        message: 'Login successful!'
      };
    } else {
      return {
        success: false,
        message: 'Invalid credentials. Please check your password.'
      };
    }
  }

  static async registerUser(identifier: string, password: string): Promise<{ success: boolean; message: string }> {
    // Simulate registration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, always succeed
    return {
      success: true,
      message: 'Account created successfully! Please verify your OTP.'
    };
  }

  static async resetPassword(identifier: string, newPassword: string, otp: string): Promise<{ success: boolean; message: string }> {
    const otpVerification = this.verifyOTP(identifier, otp);
    
    if (!otpVerification.success) {
      return otpVerification;
    }

    // Simulate password reset
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Password reset successfully!'
    };
  }
}