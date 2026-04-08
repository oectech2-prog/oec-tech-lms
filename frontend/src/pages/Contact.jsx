import { useState } from 'react';
import { sendContact } from '../lib/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle, Send, ExternalLink } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await sendContact(form);
      toast.success('Message sent successfully! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div data-testid="contact-page" className="page-transition min-h-screen bg-[#050505]">
      <section className="pt-12 pb-8 border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Get in Touch</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-base text-[#A1A1AA] max-w-xl">
            Have questions about our courses? We are here to help. Reach out anytime.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111111] border border-[#27272A] rounded-2xl p-8 space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-[#D4AF37] shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Email</h4>
                  <p className="text-sm text-[#A1A1AA]">info@oectechs.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-[#D4AF37] shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Phone</h4>
                  <p className="text-sm text-[#A1A1AA]">0300-0517616</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-[#D4AF37] shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Location</h4>
                  <p className="text-sm text-[#A1A1AA]">OEC Tech Institute, Chunian, Pakistan</p>
                  <a
                    href="https://maps.app.goo.gl/ateRRsVJD3z4GRTX8"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="contact-directions-link"
                    className="text-xs text-[#D4AF37] hover:text-[#FBBF24] transition-colors inline-flex items-center gap-1 mt-1"
                  >
                    Get Directions <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <a
              href="https://wa.me/923000517616"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="contact-whatsapp-btn"
              className="block bg-green-600/10 border border-green-600/30 rounded-2xl p-6 hover:bg-green-600/20 transition-colors group"
            >
              <MessageCircle className="w-8 h-8 text-green-400 mb-3" />
              <h4 className="text-lg font-bold text-white mb-1">Chat on WhatsApp</h4>
              <p className="text-sm text-[#A1A1AA]">Quick response guaranteed. Click to start chatting now.</p>
            </a>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-[#111111] border border-[#27272A] rounded-2xl p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white text-sm mb-2 block">Full Name *</Label>
                  <Input
                    data-testid="contact-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="bg-[#050505] border-[#27272A] text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <Label className="text-white text-sm mb-2 block">Email *</Label>
                  <Input
                    data-testid="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="bg-[#050505] border-[#27272A] text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                </div>
              </div>
              <div>
                <Label className="text-white text-sm mb-2 block">Subject</Label>
                <Input
                  data-testid="contact-subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="What's this about?"
                  className="bg-[#050505] border-[#27272A] text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                />
              </div>
              <div>
                <Label className="text-white text-sm mb-2 block">Message *</Label>
                <Textarea
                  data-testid="contact-message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us how we can help..."
                  rows={5}
                  className="bg-[#050505] border-[#27272A] text-white focus:border-[#D4AF37] focus:ring-[#D4AF37] resize-none"
                />
              </div>
              <button
                type="submit"
                data-testid="contact-submit-btn"
                disabled={submitting}
                className="btn-gold px-6 py-2.5 text-sm disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section data-testid="contact-map-section" className="py-16 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Find Us on Map</h2>
            <div className="rounded-2xl overflow-hidden border border-[#27272A]">
              <iframe
                data-testid="contact-map-iframe"
                src="https://www.google.com/maps?q=OEC+Tech+Institute+Chunian&output=embed"
                width="100%"
                height="450"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.95) contrast(0.9)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="OEC Tech Institute Location"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
