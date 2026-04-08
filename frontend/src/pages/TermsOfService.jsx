import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
};

export default function TermsOfService() {
  return (
    <div data-testid="terms-of-service-page" className="page-transition min-h-screen bg-[#050505]">
      <section className="pt-12 pb-8 border-b border-[#27272A]">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-[#D4AF37]" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Terms of Service</h1>
          </div>
          <p className="text-sm text-[#A1A1AA]">Last updated: April 7, 2026</p>
        </div>
      </section>

      <section className="py-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-4xl mx-auto px-6 md:px-12 space-y-10">
          <motion.div variants={fadeUp} className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              By accessing and using the OEC Tech Institute platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. These terms apply to all students, visitors, and users of the website.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Account Registration</h2>
            <div className="text-sm text-[#A1A1AA] leading-relaxed space-y-3">
              <ul className="list-disc pl-6 space-y-2">
                <li>You must sign in using Google OAuth to create an account</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must provide accurate information and keep it up to date</li>
                <li>You must not share your account credentials with others</li>
                <li>We reserve the right to suspend accounts that violate these terms</li>
              </ul>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={2} className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Course Enrollment & Access</h2>
            <div className="text-sm text-[#A1A1AA] leading-relaxed space-y-3">
              <ul className="list-disc pl-6 space-y-2">
                <li>Course enrollment requires payment of the specified course fee and admission fee</li>
                <li>Payment is made via JazzCash, EasyPaisa, or bank transfer</li>
                <li>Enrollment is confirmed only after admin verification of your payment receipt</li>
                <li>Course access is granted for a lifetime once enrollment is approved</li>
                <li>Course content, including videos, assignments, and materials, is for your personal learning only</li>
              </ul>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={3} className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Student Responsibilities</h2>
            <div className="text-sm text-[#A1A1AA] leading-relaxed space-y-3">
              <ul className="list-disc pl-6 space-y-2">
                <li>Complete assignments and projects as outlined in the weekly course structure</li>
                <li>Do not redistribute, copy, or share course content with non-enrolled individuals</li>
                <li>Maintain respectful communication with instructors and fellow students</li>
                <li>Do not use the platform for any unlawful or unauthorized purpose</li>
                <li>Submit original work for all assignments — plagiarism will result in account suspension</li>
              </ul>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Certificates</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Upon successful completion of all course requirements (weekly assignments and final project), you are eligible to receive a digital certificate from OEC Tech Institute. Certificates are issued at the discretion of the institute and require admin approval. Diploma certificates are awarded upon completion of all courses within a diploma track.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={5} className="space-y-4">
            <h2 className="text-xl font-bold text-white">6. Intellectual Property</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              All course content, including videos, text, graphics, logos, and materials, is the intellectual property of OEC Tech Institute. You are granted a limited, non-exclusive, non-transferable license to access the content for personal educational use only. Any unauthorized reproduction or distribution is strictly prohibited.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={6} className="space-y-4">
            <h2 className="text-xl font-bold text-white">7. Limitation of Liability</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              OEC Tech Institute provides educational content and does not guarantee specific outcomes such as employment or income. We are not liable for any indirect, incidental, or consequential damages arising from the use of our platform. Our total liability shall not exceed the amount paid for the relevant course.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={7} className="space-y-4">
            <h2 className="text-xl font-bold text-white">8. Modifications</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated date. Continued use of the platform after changes constitutes acceptance of the updated terms.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={8} className="space-y-4">
            <h2 className="text-xl font-bold text-white">9. Contact</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              For questions about these terms, contact us at:<br />
              Email: <span className="text-[#D4AF37]">info@oectechs.com</span><br />
              Phone: <span className="text-[#D4AF37]">0300-0517616</span>
            </p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
