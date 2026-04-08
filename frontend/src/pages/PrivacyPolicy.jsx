import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
};

export default function PrivacyPolicy() {
  return (
    <div data-testid="privacy-policy-page" className="page-transition min-h-screen bg-[#050505]">
      <section className="pt-12 pb-8 border-b border-[#27272A]">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-[#D4AF37]" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-sm text-[#A1A1AA]">Last updated: April 7, 2026</p>
        </div>
      </section>

      <section className="py-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-4xl mx-auto px-6 md:px-12 space-y-10">
          <motion.div variants={fadeUp} className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
            <div className="text-sm text-[#A1A1AA] leading-relaxed space-y-3">
              <p>OEC Tech Institute ("we", "our", "us") collects the following information when you use our platform:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Personal Information:</strong> Name, email address, and profile picture provided through Google OAuth sign-in.</li>
                <li><strong className="text-white">Payment Information:</strong> Fee receipt images, transaction references, and payment method selections. We do not store credit/debit card numbers.</li>
                <li><strong className="text-white">Course Data:</strong> Enrollment records, course progress, assignment submissions, and completion status.</li>
                <li><strong className="text-white">Communication Data:</strong> Messages sent through the contact form or WhatsApp inquiries.</li>
                <li><strong className="text-white">Usage Data:</strong> Browser type, device information, IP address, and pages visited for analytics purposes.</li>
              </ul>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. How We Use Your Information</h2>
            <div className="text-sm text-[#A1A1AA] leading-relaxed space-y-3">
              <ul className="list-disc pl-6 space-y-2">
                <li>To create and manage your student account</li>
                <li>To process course enrollments and verify payments</li>
                <li>To deliver course content, track progress, and issue certificates</li>
                <li>To send enrollment confirmations and payment approval notifications via email</li>
                <li>To respond to your inquiries and provide customer support</li>
                <li>To improve our platform and course offerings</li>
              </ul>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={2} className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Data Security</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              We implement industry-standard security measures to protect your personal data. Your account is secured through Google OAuth authentication. Payment receipts are stored securely and accessible only to authorized admin personnel for verification purposes.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={3} className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Data Sharing</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. Your data may be shared only with: Google (for authentication), email service providers (for transactional notifications), and as required by law.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Cookies & Tracking</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              We use session cookies to maintain your authentication state. We may use analytics tools to understand platform usage and improve our services. You can control cookie settings through your browser preferences.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={5} className="space-y-4">
            <h2 className="text-xl font-bold text-white">6. Your Rights</h2>
            <div className="text-sm text-[#A1A1AA] leading-relaxed space-y-3">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and review your personal data</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt out of promotional communications</li>
              </ul>
              <p>To exercise these rights, contact us at <span className="text-[#D4AF37]">info@oectechs.com</span>.</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={6} className="space-y-4">
            <h2 className="text-xl font-bold text-white">7. Contact Us</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              For any privacy-related questions or concerns, reach us at:<br />
              Email: <span className="text-[#D4AF37]">info@oectechs.com</span><br />
              Phone: <span className="text-[#D4AF37]">0300-0517616</span><br />
              Address: OEC Tech Institute, Chunian, Pakistan
            </p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
