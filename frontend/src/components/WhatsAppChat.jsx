import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const PHONE = '923000517616';

  return (
    <div className="fixed bottom-6 left-6 z-50" data-testid="whatsapp-chat-widget">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="mb-3 w-72 bg-[#111111] border border-[#27272A] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            <div className="bg-green-600 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">OEC Tech Institute</p>
                  <p className="text-[10px] text-green-100">Typically replies instantly</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                data-testid="whatsapp-close-btn"
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-[#0A0A0A] rounded-xl p-3 mb-4">
                <p className="text-sm text-[#A1A1AA] leading-relaxed">
                  Hi! Welcome to OEC Tech Institute. How can we help you today? Ask us about our courses, enrollment, or anything else.
                </p>
              </div>
              <a
                href={`https://wa.me/${PHONE}?text=Hi%20OEC%20Tech%20Institute!%20I%20have%20a%20question%20about%20your%20courses.`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="whatsapp-start-chat-btn"
                className="block w-full bg-green-600 text-white text-center text-sm font-semibold py-3 rounded-xl hover:bg-green-500 transition-colors"
              >
                Start Chat
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        data-testid="whatsapp-toggle-btn"
        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:bg-green-400 transition-colors"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </motion.button>
    </div>
  );
}
