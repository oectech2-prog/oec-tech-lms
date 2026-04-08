import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer data-testid="main-footer" className="bg-[#0A0A0A] border-t border-[#27272A]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-[#D4AF37]" />
              <span className="text-lg font-bold text-white">
                OEC <span className="text-[#D4AF37]">Tech</span> Institute
              </span>
            </div>
            <p className="text-[#A1A1AA] text-sm leading-relaxed">
              Empowering students across Pakistan, UAE, UK & USA with real digital skills to earn online. Practical training, lifetime access at OEC Tech Institute.
            </p>
            <a
              href="https://wa.me/923000517616"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-whatsapp"
              className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { to: '/courses', label: 'All Courses' },
                { to: '/diploma-tracks', label: 'Diploma Tracks' },
                { to: '/reviews', label: 'Student Reviews' },
                { to: '/about', label: 'About Us' },
                { to: '/faq', label: 'FAQ' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Popular Courses</h4>
            <ul className="space-y-3">
              {[
                'Social Media Marketing',
                'Graphic Designing',
                'Shopify Dropshipping',
                'WordPress Development',
                'Amazon VA',
              ].map((course) => (
                <li key={course}>
                  <Link to="/courses" className="text-sm text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">
                    {course}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                info@oectechs.com
              </li>
              <li className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                0300-0517616
              </li>
              <li className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                Pakistan | UAE | UK | USA
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#27272A] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#A1A1AA]">
            &copy; {new Date().getFullYear()} OEC Tech Institute. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-[#A1A1AA]">
            <Link to="/privacy-policy" data-testid="footer-privacy-link" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" data-testid="footer-terms-link" className="hover:text-[#D4AF37] transition-colors">Terms of Service</Link>
            <Link to="/refund-policy" data-testid="footer-refund-link" className="hover:text-[#D4AF37] transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
