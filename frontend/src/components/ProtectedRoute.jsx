import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (location.state?.user) {
      setIsChecked(true);
      return;
    }

    if (!user) {
      checkAuth().then(() => setIsChecked(true));
    } else {
      setIsChecked(true);
    }
  }, [loading, user, checkAuth, location.state]);

  useEffect(() => {
    if (!isChecked || loading) return;
    if (!user) {
      if (requireAdmin) {
        navigate('/admin/login', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } else if (requireAdmin && user.role !== 'admin') {
      navigate('/admin/login', { replace: true });
    }
  }, [isChecked, loading, user, requireAdmin, navigate]);

  if (loading || !isChecked) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;
  if (requireAdmin && user.role !== 'admin') return null;

  return children;
}
