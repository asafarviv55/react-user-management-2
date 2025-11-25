import React, { useEffect, useState } from 'react';
import { UserSession } from '../../types/user';
import userService from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';

const SessionManager: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await userService.getUserSessions(user.id);
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to revoke this session?')) {
      return;
    }

    try {
      await userService.revokeSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const parseUserAgent = (userAgent: string) => {
    // Simple parsing - in production, use a library like ua-parser-js
    if (userAgent.includes('Chrome')) return { browser: 'Chrome', icon: '🌐' };
    if (userAgent.includes('Firefox')) return { browser: 'Firefox', icon: '🦊' };
    if (userAgent.includes('Safari')) return { browser: 'Safari', icon: '🧭' };
    if (userAgent.includes('Edge')) return { browser: 'Edge', icon: '🔷' };
    return { browser: 'Unknown', icon: '💻' };
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold">Active Sessions</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Manage your active sessions across all devices
          </p>
        </div>

        <div className="divide-y dark:divide-gray-700">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No active sessions found
            </div>
          ) : (
            sessions.map((session) => {
              const { browser, icon } = parseUserAgent(session.userAgent);
              const isExpired = new Date(session.expiresAt) < new Date();

              return (
                <div key={session.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="text-4xl">{icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{browser}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mt-1">
                          <div>
                            <span className="font-medium">IP Address:</span> {session.ipAddress}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span> {formatDate(session.createdAt)}
                          </div>
                          <div>
                            <span className="font-medium">Expires:</span> {formatDate(session.expiresAt)}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>{' '}
                            {isExpired ? (
                              <span className="text-red-600">Expired</span>
                            ) : session.isActive ? (
                              <span className="text-green-600">Active</span>
                            ) : (
                              <span className="text-gray-600">Inactive</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {session.isActive && !isExpired && (
                      <button
                        onClick={() => handleRevoke(session.id)}
                        className="ml-4 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionManager;
