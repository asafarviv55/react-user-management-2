import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';

const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage('');

    try {
      const updatedUser = await userService.update(user.id, formData);
      updateUser(updatedUser);
      setEditing(false);
      setMessage('Profile updated successfully');
    } catch (error: any) {
      setMessage('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    setMessage('');

    try {
      const result = await userService.uploadAvatar(user.id, file);
      updateUser({ ...user, avatar: result.url });
      setMessage('Avatar updated successfully');
    } catch (error: any) {
      setMessage('Error uploading avatar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to view your profile</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>

        {/* Avatar */}
        <div className="px-6 -mt-16 mb-6">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6">
          {message && (
            <div className={`mb-4 p-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-3xl font-bold">{user.name}</h2>
                <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-t dark:border-gray-700">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Role</span>
                  <p className="font-semibold capitalize">{user.role}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  <p className="font-semibold capitalize">{user.status}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Phone</span>
                  <p className="font-semibold">{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Member Since</span>
                  <p className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
