import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { updateProfile, studentUpload } from '../lib/api';
import { toast } from 'sonner';
import { ArrowLeft, User, Mail, Shield, Calendar, Camera, Save, Loader2 } from 'lucide-react';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [picPreview, setPicPreview] = useState(null);
  const fileRef = useRef(null);

  const API = process.env.REACT_APP_BACKEND_URL;

  const handlePicSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setPicPreview(ev.target.result);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const res = await studentUpload(file);
      const picUrl = `${API}${res.data.url}`;
      await updateProfile({ picture: picUrl });
      await refreshUser();
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error('Failed to upload picture');
      setPicPreview(null);
    }
    setUploading(false);
  };

  const handleSaveName = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    if (name.trim() === user?.name) return;
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      await refreshUser();
      toast.success('Name updated!');
    } catch (err) {
      toast.error('Failed to update name');
    }
    setSaving(false);
  };

  const displayPic = picPreview || user?.picture;

  return (
    <div data-testid="profile-page" className="min-h-screen bg-[#050505] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-white mb-8">Profile Settings</h1>

        <div className="bg-[#111111] border border-[#27272A] rounded-2xl p-6 sm:p-8">
          {/* Avatar + Name Edit */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-[#27272A]">
            <div className="relative group">
              {displayPic ? (
                <img src={displayPic} alt="" className="w-24 h-24 rounded-full border-2 border-[#D4AF37] object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-3xl font-bold">
                  {user?.name?.charAt(0)}
                </div>
              )}
              <button
                data-testid="change-pic-btn"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-black hover:bg-[#c4a030] transition-colors shadow-lg"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePicSelect} className="hidden" />
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Full Name</label>
              <div className="flex gap-2">
                <input
                  data-testid="profile-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-[#050505] border border-[#27272A] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  placeholder="Your full name"
                />
                <button
                  data-testid="save-name-btn"
                  onClick={handleSaveName}
                  disabled={saving || name.trim() === user?.name}
                  className="px-4 py-2.5 bg-[#D4AF37] text-black rounded-lg text-xs font-bold hover:bg-[#c4a030] transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-2">{user?.email}</p>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full mt-2 inline-block ${
                user?.role === 'admin' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-blue-500/10 text-blue-400'
              }`}>
                {user?.role === 'admin' ? 'Admin' : 'Student'}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <div>
                <p className="text-xs text-[#A1A1AA]">Email</p>
                <p className="text-sm text-white font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Shield className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <div>
                <p className="text-xs text-[#A1A1AA]">Role</p>
                <p className="text-sm text-white font-medium capitalize">{user?.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <div>
                <p className="text-xs text-[#A1A1AA]">Member Since</p>
                <p className="text-sm text-white font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
