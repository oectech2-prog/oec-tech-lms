import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestAdminOTP, verifyAdminOTP } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Shield, Phone, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AdminLogin() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('03000517616');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin');
  }, [user, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleRequestOTP = async () => {
    if (!phone || phone.length < 10) { toast.error('Enter valid phone number'); return; }
    setLoading(true);
    try {
      await requestAdminOTP(phone);
      setStep(2);
      setCountdown(60);
      toast.success('OTP sent! Check backend logs for the code.');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '')) verifyOTP(newOtp.join(''));
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (code) => {
    setLoading(true);
    try {
      const res = await verifyAdminOTP(phone, code);
      const { user: adminUser, session_token } = res.data;
      if (refreshUser) await refreshUser();
      toast.success('Welcome, Admin!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-sm text-[#A1A1AA]">OEC Tech Institute</p>
        </div>

        <div className="bg-[#111111] border border-[#27272A] rounded-2xl p-6">
          {step === 1 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <label className="text-xs font-medium text-[#A1A1AA] mb-2 block">Admin Phone Number</label>
              <div className="relative mb-4">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                <input
                  data-testid="admin-phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03XXXXXXXXX"
                  className="w-full bg-[#050505] border border-[#27272A] rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
              <button
                data-testid="admin-send-otp-btn"
                onClick={handleRequestOTP}
                disabled={loading}
                className="w-full btn-gold py-3 text-sm disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2 mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <p className="text-xs text-green-300">OTP sent to {phone}</p>
              </div>
              <label className="text-xs font-medium text-[#A1A1AA] mb-3 block">Enter 6-digit OTP</label>
              <div className="flex gap-2 mb-4 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    data-testid={`admin-otp-input-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-10 h-12 text-center bg-[#050505] border border-[#27272A] rounded-lg text-white text-lg font-bold focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                ))}
              </div>
              {loading && <p className="text-xs text-[#D4AF37] text-center mb-3">Verifying...</p>}
              <div className="flex items-center justify-between text-xs">
                <button
                  data-testid="admin-resend-otp-btn"
                  onClick={handleRequestOTP}
                  disabled={countdown > 0 || loading}
                  className="text-[#D4AF37] hover:text-[#FBBF24] disabled:text-[#A1A1AA] disabled:cursor-not-allowed transition-colors"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
                <button
                  onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); }}
                  className="text-[#A1A1AA] hover:text-white transition-colors"
                >
                  Change number
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <p className="text-[10px] text-[#A1A1AA] text-center mt-4">
          Secured with WhatsApp OTP verification
        </p>
      </motion.div>
    </div>
  );
}
