export class DeviceService {
  private static readonly DEVICE_KEY = 'device_fingerprint';
  
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
      (navigator as any).deviceMemory || 'unknown'
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
      return { 
        allowed: false, 
        message: 'This account is already registered on another device. Each account can only be used on one device.' 
      };
    }
    
    return { allowed: true, message: 'Device access granted' };
  }
}