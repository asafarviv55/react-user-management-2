import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';

const TwoFactorSetup: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const status = await authService.get2FAStatus();
      setEnabled(status.enabled);
    } catch (error) {
      console.error('Failed to load 2FA status:', error);
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    setMessage('');

    try {
      const data = await authService.enable2FA();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setShowSetup(true);
    } catch (error: any) {
      setMessage('Error enabling 2FA: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setMessage('');

    try {
      const result = await authService.verify2FA(verificationCode);
      if (result.verified) {
        setEnabled(true);
        setShowSetup(false);
        setMessage('Two-factor authentication enabled successfully!');
      } else {
        setMessage('Invalid verification code. Please try again.');
      }
    } catch (error: any) {
      setMessage('Error verifying code: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication?')) {
      return;
    }

    const code = prompt('Enter your 2FA code to confirm:');
    if (!code) return;

    setLoading(true);
    setMessage('');

    try {
      await authService.disable2FA(code);
      setEnabled(false);
      setMessage('Two-factor authentication disabled');
    } catch (error: any) {
      setMessage('Error disabling 2FA: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '2fa-backup-codes.txt';
    link.click();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Two-Factor Authentication</h2>

        {message && (
          <div className={`p-4 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        {!enabled && !showSetup && (
          <div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
            <button
              onClick={handleEnable}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Enable 2FA'}
            </button>
          </div>
        )}

        {showSetup && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Step 1: Scan QR Code</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              {qrCode && (
                <div className="flex justify-center p-4 bg-white rounded">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Or enter this code manually: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{secret}</code>
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Step 2: Save Backup Codes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Save these backup codes in a safe place. You can use them to access your account if you lose your device.
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index}>{code}</div>
                ))}
              </div>
              <button
                onClick={downloadBackupCodes}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Download Backup Codes
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Step 3: Verify</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Enter the 6-digit code from your authenticator app
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="flex-1 px-4 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  maxLength={6}
                />
                <button
                  onClick={handleVerify}
                  disabled={loading || verificationCode.length !== 6}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}

        {enabled && !showSetup && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-600 font-semibold">Two-factor authentication is enabled</span>
            </div>
            <button
              onClick={handleDisable}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Disable 2FA'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;
