import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RotateCcw, ArrowLeft } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
};

export default function RefundPolicy() {
  return (
    <div data-testid="refund-policy-page" className="page-transition min-h-screen bg-[#050505]">
      <section className="pt-12 pb-8 border-b border-[#27272A]">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw className="w-8 h-8 text-[#D4AF37]" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Payment & Refund Policy</h1>
          </div>
          <p className="text-sm text-[#A1A1AA]">Last updated: April 7, 2026</p>
        </div>
      </section>

      <section className="py-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-4xl mx-auto px-6 md:px-12 space-y-10">
          <motion.div variants={fadeUp} className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Payment Methods</h2>
            <div className="text-sm text-[#A1A1AA] leading-relaxed space-y-3">
              <p>OEC Tech Institute accepts payments through the following channels:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="bg-[#111111] border border-[#27272A] rounded-xl p-4">
                  <h4 className="text-sm font-bold text-red-400 mb-2">JazzCash</h4>
                  <p className="text-xs text-[#A1A1AA]">Account: 983012259</p>
                  <p className="text-xs text-[#A1A1AA]">Title: OEC Tech Institute</p>
                </div>
                <div className="bg-[#111111] border border-[#27272A] rounded-xl p-4">
                  <h4 className="text-sm font-bold text-green-400 mb-2">EasyPaisa</h4>
                  <p className="text-xs text-[#A1A1AA]">Account: 0300-1413747</p>
                  <p className="text-xs text-[#A1A1AA]">Title: Sadam Mubarak</p>
                </div>
                <div className="bg-[#111111] border border-[#27272A] rounded-xl p-4">
                  <h4 className="text-sm font-bold text-blue-400 mb-2">Soneri Bank</h4>
                  <p className="text-xs text-[#A1A1AA]">Account: 20016289664</p>
                  <p className="text-xs text-[#A1A1AA]">Title: Sadam Mubarak</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Fee Structure</h2>
            <div className="text-sm text-[#A1A1AA] leading-relaxed space-y-3">
              <p>Each course has two components:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Course Fee:</strong> The main tuition fee for the course content and materials</li>
                <li><strong className="text-white">Admission Fee:</strong> A one-time, non-refundable registration fee</li>
              </ul>
              <p>The total amount payable is the sum of Course Fee + Admission Fee. For diploma tracks, the total is the combined fees of all included courses.</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={2} className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Payment Process</h2>
            <div className="text-sm text-[#A1A1AA] leading-relaxed space-y-3">
              <ol className="list-decimal pl-6 space-y-2">
                <li>Select your course and proceed to checkout</li>
                <li>Choose your preferred payment method (JazzCash, EasyPaisa, or Bank Transfer)</li>
                <li>Transfer the total amount to the specified account</li>
                <li>Upload your payment receipt/screenshot on the checkout page</li>
                <li>Enter the transaction reference number (if available)</li>
                <li>Submit your enrollment — our admin team will verify and approve within 24 hours</li>
              </ol>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={3} className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Refund Policy</h2>
            <div className="text-sm text-[#A1A1AA] leading-relaxed space-y-3">
              <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-5">
                <h4 className="text-sm font-bold text-[#D4AF37] mb-3">Refund Eligibility</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-white">Within 3 days of enrollment approval:</strong> Full course fee refund (minus admission fee) if you have not accessed more than 20% of the course content</li>
                  <li><strong className="text-white">After 3 days:</strong> No refund will be provided once you have had access for more than 3 days or accessed more than 20% of course content</li>
                  <li><strong className="text-white">Admission Fee:</strong> The admission fee is non-refundable under all circumstances</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Refund Process</h2>
            <div className="text-sm text-[#A1A1AA] leading-relaxed space-y-3">
              <ol className="list-decimal pl-6 space-y-2">
                <li>Contact us at <span className="text-[#D4AF37]">info@oectechs.com</span> or WhatsApp <span className="text-[#D4AF37]">0300-0517616</span> with your refund request</li>
                <li>Include your registered email, course name, and reason for refund</li>
                <li>Our team will review your request within 2-3 business days</li>
                <li>If approved, the refund will be processed to your original payment method within 5-7 business days</li>
              </ol>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={5} className="space-y-4">
            <h2 className="text-xl font-bold text-white">6. Non-Refundable Situations</h2>
            <div className="text-sm text-[#A1A1AA] leading-relaxed space-y-3">
              <ul className="list-disc pl-6 space-y-2">
                <li>Admission fees are non-refundable</li>
                <li>Course access beyond 3 days or 20% content consumption</li>
                <li>Certificate issuance fees (if applicable)</li>
                <li>Suspension or removal due to Terms of Service violations</li>
                <li>Diploma track enrollments — individual courses within a track follow the same per-course refund policy</li>
              </ul>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={6} className="space-y-4">
            <h2 className="text-xl font-bold text-white">7. Course Transfer</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Course enrollments are non-transferable. You may not transfer your course access to another person. If you wish to change to a different course, please contact our support team to discuss available options.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={7} className="space-y-4">
            <h2 className="text-xl font-bold text-white">8. Contact Us</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              For payment or refund inquiries:<br />
              Email: <span className="text-[#D4AF37]">info@oectechs.com</span><br />
              WhatsApp: <span className="text-[#D4AF37]">0300-0517616</span><br />
              Address: OEC Tech Institute, Chunian, Pakistan
            </p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
