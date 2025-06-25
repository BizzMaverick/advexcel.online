import { SecurityService } from './securityService';
import { AuditService } from './auditService';
import { TrustedDevice } from '../types/auth';

export class DeviceService {
  private static readonly DEVICE_KEY = 'device_fingerprint';
  private static readonly MAX_TRUSTED_DEVICES = 5;
  
  static generateDeviceFingerprint(): string {
    // Generate a unique device fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 'unknown',
      (navigator as any).deviceMemory || 'unknown',
      navigator.platform,
      navigator.vendor
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  static getStoredDeviceId(): string | null {
    return localStorage.getItem(this.DEVICE_KEY);
  }

  static setDeviceId(deviceId: string): void {
    localStorage.setItem(this.DEVICE_KEY, deviceId);
  }

  static isDeviceRegistered(userId: string): boolean {
    const currentDeviceId = this.generateDeviceFingerprint();
    const registeredDeviceId = localStorage.getItem(`user_device_${userId}`);
    
    return registeredDeviceId === currentDeviceId;
  }

  static registerDevice(userId: string): void {
    const deviceId = this.generateDeviceFingerprint();
    localStorage.setItem(`user_device_${userId}`, deviceId);
    this.setDeviceId(deviceId);
    
    // Log device registration
    AuditService.log({
      action: 'device_registered',
      resource: 'device',
      details: { deviceId, userAgent: navigator.userAgent },
      ipAddress: '127.0.0.1',
      success: true
    });
  }

  static checkDeviceAccess(userId: string): { allowed: boolean; message: string } {
    const currentDeviceId = this.generateDeviceFingerprint();
    const registeredDeviceId = localStorage.getItem(`user_device_${userId}`);
    
    if (!registeredDeviceId) {
      // First time login, register this device
      this.registerDevice(userId);
      return { allowed: true, message: 'Device registered successfully' };
    }
    
    if (registeredDeviceId !== currentDeviceId) {
      // Log suspicious activity
      SecurityService.logSecurityEvent({
        type: 'suspicious_activity',
        userId,
        details: { 
          reason: 'Device mismatch', 
          registeredDevice: registeredDeviceId,
          currentDevice: currentDeviceId
        },
        ipAddress: '127.0.0.1',
        severity: 'warning'
      });
      
      return { 
        allowed: false, 
        message: 'This account is already registered on another device. Each account can only be used on one device.' 
      };
    }
    
    return { allowed: true, message: 'Device access granted' };
  }

  static async addTrustedDevice(
    userId: string, 
    deviceName?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const deviceFingerprint = this.generateDeviceFingerprint();
      const trustedDevices = await this.getTrustedDevices(userId);
      
      // Check if device is already trusted
      if (trustedDevices.some(device => device.deviceFingerprint === deviceFingerprint)) {
        return { success: true, message: 'Device already trusted' };
      }
      
      // Check if max devices reached
      if (trustedDevices.length >= this.MAX_TRUSTED_DEVICES) {
        return { 
          success: false, 
          message: `Maximum of ${this.MAX_TRUSTED_DEVICES} trusted devices allowed. Please remove one first.` 
        };
      }
      
      // Add new trusted device
      const newDevice: TrustedDevice = {
        id: Date.now().toString(),
        deviceFingerprint,
        deviceName: deviceName || this.getDeviceName(),
        lastUsed: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent
      };
      
      trustedDevices.push(newDevice);
      localStorage.setItem(`trusted_devices_${userId}`, JSON.stringify(trustedDevices));
      
      // Log device trust
      AuditService.log({
        action: 'device_trusted',
        resource: 'device',
        details: { deviceId: deviceFingerprint, deviceName: newDevice.deviceName },
        ipAddress: '127.0.0.1',
        success: true
      });
      
      return { success: true, message: 'Device added to trusted devices' };
    } catch (error) {
      console.error('Error adding trusted device:', error);
      return { success: false, message: 'Failed to add trusted device' };
    }
  }

  static async removeTrustedDevice(
    userId: string, 
    deviceId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const trustedDevices = await this.getTrustedDevices(userId);
      const updatedDevices = trustedDevices.filter(device => device.id !== deviceId);
      
      localStorage.setItem(`trusted_devices_${userId}`, JSON.stringify(updatedDevices));
      
      // Log device removal
      AuditService.log({
        action: 'device_removed',
        resource: 'device',
        details: { deviceId },
        ipAddress: '127.0.0.1',
        success: true
      });
      
      return { success: true, message: 'Device removed from trusted devices' };
    } catch (error) {
      console.error('Error removing trusted device:', error);
      return { success: false, message: 'Failed to remove trusted device' };
    }
  }

  static async getTrustedDevices(userId: string): Promise<TrustedDevice[]> {
    try {
      const devices = localStorage.getItem(`trusted_devices_${userId}`);
      return devices ? JSON.parse(devices) : [];
    } catch {
      return [];
    }
  }

  static async updateDeviceLastUsed(userId: string): Promise<void> {
    try {
      const deviceFingerprint = this.generateDeviceFingerprint();
      const trustedDevices = await this.getTrustedDevices(userId);
      
      const updatedDevices = trustedDevices.map(device => {
        if (device.deviceFingerprint === deviceFingerprint) {
          return { ...device, lastUsed: new Date() };
        }
        return device;
      });
      
      localStorage.setItem(`trusted_devices_${userId}`, JSON.stringify(updatedDevices));
    } catch (error) {
      console.error('Error updating device last used:', error);
    }
  }

  private static getDeviceName(): string {
    const ua = navigator.userAgent;
    let deviceType = 'Unknown Device';
    
    if (/iPhone|iPad|iPod/.test(ua)) {
      deviceType = 'iOS Device';
    } else if (/Android/.test(ua)) {
      deviceType = 'Android Device';
    } else if (/Windows/.test(ua)) {
      deviceType = 'Windows Device';
    } else if (/Mac/.test(ua)) {
      deviceType = 'Mac Device';
    } else if (/Linux/.test(ua)) {
      deviceType = 'Linux Device';
    }
    
    let browserInfo = 'Unknown Browser';
    if (ua.includes('Chrome')) browserInfo = 'Chrome';
    else if (ua.includes('Firefox')) browserInfo = 'Firefox';
    else if (ua.includes('Safari')) browserInfo = 'Safari';
    else if (ua.includes('Edge')) browserInfo = 'Edge';
    
    return `${deviceType} (${browserInfo})`;
  }
}