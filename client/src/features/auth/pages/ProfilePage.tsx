import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { User, Mail, Shield, Save, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await api.put('/auth/profile', { name, avatar });
      const updatedUser = response.data.data;
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarSelect = () => {
    const randomAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
      name || 'default'
    )}_${Math.random()}`;
    setAvatar(randomAvatar);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 lg:p-8">
      <div>
        <h2 className="text-3xl font-bold font-display tracking-tight text-[var(--text-primary)]">
          Account Settings
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage your personal details and custom settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column — Avatar card */}
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center h-fit">
          <div className="relative group mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt="Profile avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-[var(--text-tertiary)]" />
              )}
            </div>
            <button
              onClick={handleAvatarSelect}
              type="button"
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] transition-colors shadow"
              title="Generate random avatar"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-lg font-bold text-[var(--text-primary)] font-display">{user?.name}</h3>
          <p className="text-xs uppercase font-semibold text-[var(--text-tertiary)] mt-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            {user?.role} Account
          </p>
          <button
            onClick={handleAvatarSelect}
            className="btn btn-secondary w-full py-2 mt-6 text-xs"
          >
            Generate Random Avatar
          </button>
        </div>

        {/* Right column — Form settings */}
        <div className="lg:col-span-2 glass-card p-8">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
                Email Address (ReadOnly)
              </label>
              <div className="relative opacity-60">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field pl-10 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
                Avatar Image URL (Optional)
              </label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="input-field"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isUpdating}
                className="btn btn-primary px-6 py-2.5 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
