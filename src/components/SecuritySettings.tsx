import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { Shield, Smartphone, Lock, Eye, EyeOff, RefreshCw, Trash2, AlertCircle, CheckCircle, Globe } from 'lucide-react';
import { DeviceService } from '../utils/deviceService';
import { TrustedDevice } from '../types/auth';

export const SecuritySettings: React.FC = () => {
  const { user, updateUser } = useAuthContext();
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMfaSecret, setShowMfaSecret] = useState(false);
  const [mfaSetup, setMfaSetup] = useState<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ipWhitelist, setIpWhitelist] = useState<string[]>([]);
  const [newIpAddress, setNewIpAddress] = useState('');
  const [sessionTimeout, setSessionTimeout] = useState(480); // 8 hours in minutes

  useEffect(() => {
    if (user) {
      loadTrustedDevices();
      setIpWhitelist(user.security.ipWhitelist || []);
      setSessionTimeout(user.security.sessionTimeout);
    }
  }, [user]);

  const loadTrustedDevices = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const devices = await DeviceService.getTrustedDevices(user.id);
      setTrustedDevices(devices);
    } catch (error) {
      setError('Failed to load trusted devices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const result = await DeviceService.removeTrustedDevice(user.id, deviceId);
      if (result.success) {
        setTrustedDevices(prev => prev.filter(device => device.id !== deviceId));
        setSuccess('Device removed successfully');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to remove device');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupMFA = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // In a real app, call your backend to generate MFA secret
      const secret = generateRandomString(32);
      const qrCode = `data:image/svg+xml;base64,${btoa('<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="white"/><text x="50" y="100" font-family="Arial" font-size="12">QR Code Placeholder</text></svg>')}`;
      const backupCodes = Array.from({ length: 10 }, () => generateRandomString(8));
      
      setMfaSetup({ secret, qrCode, backupCodes });
      setSuccess('MFA setup initialized');
    } catch (error) {
      setError('Failed to setup MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!user || !mfaSetup) return;
    
    setIsLoading(true);
    try {
      // In a real app, verify the code with your backend
      if (verificationCode === '123456') { // Demo code
        // Update user
        const updatedUser = {
          ...user,
          security: {
            ...user.security,
            mfaEnabled: true,
            mfaSecret: mfaSetup.secret
          }
        };
        
        updateUser(updatedUser);
        setSuccess('MFA enabled successfully');
        setMfaSetup(null);
      } else {
        setError('Invalid verification code');
      }
    } catch (error) {
      setError('Failed to verify MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // In a real app, call your backend to disable MFA
      const updatedUser = {
        ...user,
        security: {
          ...user.security,
          mfaEnabled: false,
          mfaSecret: undefined
        }
      };
      
      updateUser(updatedUser);
      setSuccess('MFA disabled successfully');
    } catch (error) {
      setError('Failed to disable MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIpToWhitelist = () => {
    if (!newIpAddress || !isValidIpAddress(newIpAddress)) {
      setError('Please enter a valid IP address');
      return;
    }
    
    if (ipWhitelist.includes(newIpAddress)) {
      setError('IP address already in whitelist');
      return;
    }
    
    const updatedWhitelist = [...ipWhitelist, newIpAddress];
    setIpWhitelist(updatedWhitelist);
    
    if (user) {
      const updatedUser = {
        ...user,
        security: {
          ...user.security,
          ipWhitelist: updatedWhitelist
        }
      };
      
      updateUser(updatedUser);
      setSuccess('IP address added to whitelist');
    }
    
    setNewIpAddress('');
  };

  const handleRemoveIpFromWhitelist = (ip: string) => {
    const updatedWhitelist = ipWhitelist.filter(item => item !== ip);
    setIpWhitelist(updatedWhitelist);
    
    if (user) {
      const updatedUser = {
        ...user,
        security: {
          ...user.security,
          ipWhitelist: updatedWhitelist
        }
      };
      
      updateUser(updatedUser);
      setSuccess('IP address removed from whitelist');
    }
  };

  const handleUpdateSessionTimeout = () => {
    if (user) {
      const updatedUser = {
        ...user,
        security: {
          ...user.security,
          sessionTimeout
        }
      };
      
      updateUser(updatedUser);
      setSuccess('Session timeout updated');
    }
  };

  const isValidIpAddress = (ip: string): boolean => {
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = ip.match(ipv4Regex);
    
    if (!match) return false;
    
    for (let i = 1; i <= 4; i++) {
      const octet = parseInt(match[i]);
      if (octet < 0 || octet > 255) return false;
    }
    
    return true;
  };

  const generateRandomString = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  if (!user) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Please log in to view security settings.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg mb-6">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg mb-6">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Two-Factor Authentication */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lock className="h-5 w-5 text-blue-600 mr-2" />
            Two-Factor Authentication
          </h3>

          {user.security.mfaEnabled ? (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Two-factor authentication is enabled</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Your account is protected with an additional layer of security.
                </p>
              </div>

              <button
                onClick={handleDisableMFA}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Disable Two-Factor Authentication
              </button>
            </div>
          ) : mfaSetup ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Setup Instructions</h4>
                <ol className="text-xs text-blue-700 list-decimal list-inside space-y-2">
                  <li>Install an authenticator app like Google Authenticator or Authy</li>
                  <li>Scan the QR code or enter the secret key manually</li>
                  <li>Enter the 6-digit verification code from the app</li>
                  <li>Save your backup codes in a secure location</li>
                </ol>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <img src={mfaSetup.qrCode} alt="QR Code" className="mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Scan with your authenticator app</p>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secret Key (Manual Entry)
                    </label>
                    <div className="relative">
                      <input
                        type={showMfaSecret ? 'text' : 'password'}
                        value={mfaSetup.secret}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMfaSecret(!showMfaSecret)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showMfaSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleVerifyMFA}
                      disabled={isLoading || verificationCode.length !== 6}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Verify & Enable
                    </button>
                    <button
                      onClick={() => setMfaSetup(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Backup Codes</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {mfaSetup.backupCodes.map((code, index) => (
                      <div key={index} className="font-mono text-sm bg-white p-2 rounded border border-gray-200 text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Save these backup codes in a secure location. Each code can only be used once.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Two-factor authentication adds an extra layer of security to your account by requiring a code from your phone in addition to your password.
              </p>
              <button
                onClick={handleSetupMFA}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Set Up Two-Factor Authentication
              </button>
            </div>
          )}
        </div>

        {/* Trusted Devices */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Smartphone className="h-5 w-5 text-blue-600 mr-2" />
            Trusted Devices
          </h3>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading devices...</p>
            </div>
          ) : trustedDevices.length > 0 ? (
            <div className="space-y-3">
              {trustedDevices.map(device => (
                <div key={device.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{device.deviceName}</div>
                    <div className="text-xs text-gray-500">
                      Last used: {new Date(device.lastUsed).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      IP: {device.ipAddress}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveDevice(device.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Remove device"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No trusted devices found.</p>
          )}
        </div>

        {/* IP Whitelist */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="h-5 w-5 text-blue-600 mr-2" />
            IP Address Whitelist
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Restrict access to your account to specific IP addresses. Leave empty to allow access from any IP.
          </p>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newIpAddress}
                onChange={(e) => setNewIpAddress(e.target.value)}
                placeholder="Enter IP address (e.g., 192.168.1.1)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleAddIpToWhitelist}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>

            {ipWhitelist.length > 0 ? (
              <div className="space-y-2">
                {ipWhitelist.map(ip => (
                  <div key={ip} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="font-mono text-sm">{ip}</span>
                    <button
                      onClick={() => handleRemoveIpFromWhitelist(ip)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remove IP"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No IP addresses in whitelist. Access allowed from any IP.</p>
            )}
          </div>
        </div>

        {/* Session Settings */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <RefreshCw className="h-5 w-5 text-blue-600 mr-2" />
            Session Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Math.max(5, parseInt(e.target.value) || 0))}
                  min="5"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={handleUpdateSessionTimeout}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Your session will expire after this period of inactivity. Minimum: 5 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};