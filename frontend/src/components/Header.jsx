import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Menu, X, GraduationCap, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/courses', label: 'Courses' },
  { to: '/diploma-tracks', label: 'Diplomas' },
  { to: '/video-testimonials', label: 'Testimonials' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/faq', label: 'FAQ' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);
      if (currentY < 80) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 5) {
        setVisible(false);
        setMobileOpen(false);
      } else if (currentY < lastScrollY.current - 5) {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header data-testid="main-header" className={`fixed top-0 w-full z-50 transition-all duration-300 ${visible ? 'header-visible' : 'header-hidden'} ${scrolled ? 'bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20' : 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/5'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" data-testid="logo-link">
          <GraduationCap className="w-8 h-8 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          <span className="text-lg font-bold text-white">
            OEC <span className="text-[#D4AF37]">Tech</span> Institute
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-testid={`nav-${link.label.toLowerCase()}`}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'text-[#D4AF37] bg-[#D4AF37]/10'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="user-menu-trigger" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                  {user.picture ? (
                    <img src={user.picture} alt="" className="w-8 h-8 rounded-full border border-[#D4AF37]/50" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-sm font-bold">
                      {user.name?.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm text-white font-medium">{user.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#111111] border-[#27272A] text-white min-w-[180px]">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer text-[#A1A1AA] hover:text-white focus:text-white focus:bg-white/5">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer text-[#A1A1AA] hover:text-white focus:text-white focus:bg-white/5">
                    Profile
                  </Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator className="bg-[#27272A]" />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer text-[#D4AF37] hover:text-[#FBBF24] focus:text-[#FBBF24] focus:bg-[#D4AF37]/10">
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-[#27272A]" />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                to="/login"
                data-testid="login-btn"
                className="px-5 py-2 text-sm font-semibold text-[#D4AF37] border border-[#D4AF37] rounded-full hover:bg-[#D4AF37]/10 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/courses"
                data-testid="enroll-now-header-btn"
                className="px-5 py-2 text-sm font-bold bg-[#D4AF37] text-black rounded-full hover:bg-[#FBBF24] transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
              >
                Enroll Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#050505]/95 backdrop-blur-xl border-t border-[#27272A] px-4 pb-4">
          <nav className="flex flex-col gap-1 py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium ${
                  location.pathname === link.to
                    ? 'text-[#D4AF37] bg-[#D4AF37]/10'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pt-2 border-t border-[#27272A]">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm text-white hover:bg-white/5 rounded-lg">
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg">
                    Admin Panel
                  </Link>
                )}
                <button onClick={() => { logout(); setMobileOpen(false); }} className="px-4 py-3 text-sm text-red-400 text-left hover:bg-red-500/10 rounded-lg">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-gold-outline text-center px-4 py-3 text-sm">
                  Login
                </Link>
                <Link to="/courses" onClick={() => setMobileOpen(false)} className="btn-gold text-center px-4 py-3 text-sm">
                  Enroll Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
