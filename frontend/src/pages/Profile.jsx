import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { ArrowLeft, User, Mail, Shield, Calendar } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div data-testid="profile-page" className="min-h-screen bg-[#050505] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-white mb-8">Profile Settings</h1>

        <div className="bg-[#111111] border border-[#27272A] rounded-2xl p-8">
          {/* Avatar */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#27272A]">
            {user?.picture ? (
              <img src={user.picture} alt="" className="w-20 h-20 rounded-full border-2 border-[#D4AF37]" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-2xl font-bold">
                {user?.name?.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-sm text-[#A1A1AA]">{user?.email}</p>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full mt-2 inline-block ${
                user?.role === 'admin' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-blue-500/10 text-blue-400'
              }`}>
                {user?.role === 'admin' ? 'Admin' : 'Student'}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <User className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <p className="text-xs text-[#A1A1AA]">Full Name</p>
                <p className="text-sm text-white font-medium">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <p className="text-xs text-[#A1A1AA]">Email</p>
                <p className="text-sm text-white font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <p className="text-xs text-[#A1A1AA]">Role</p>
                <p className="text-sm text-white font-medium capitalize">{user?.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <p className="text-xs text-[#A1A1AA]">Member Since</p>
                <p className="text-sm text-white font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#A1A1AA] mt-8 pt-6 border-t border-[#27272A]">
            Profile information is managed through your Google account. To update your name or profile picture, update your Google account settings.
          </p>
        </div>
      </div>
    </div>
  );
}
