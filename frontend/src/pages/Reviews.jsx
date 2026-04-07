import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getReviews } from '../lib/api';
import { Star, Quote } from 'lucide-react';

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#27272A]'}`} />
      ))}
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    getReviews().then(r => setReviews(r.data));
  }, []);

  return (
    <div data-testid="reviews-page" className="page-transition min-h-screen bg-[#050505]">
      <section className="pt-12 pb-8 border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Testimonials</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Student Reviews</h1>
          <p className="text-base text-[#A1A1AA] max-w-xl">
            Hear from our students who have transformed their careers with digital skills.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
              <motion.div
                key={review.review_id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-[#111111] border border-[#27272A] rounded-2xl p-8 hover:border-[#D4AF37]/30 transition-colors"
              >
                <Quote className="w-8 h-8 text-[#D4AF37]/30 mb-4" />
                <StarRating rating={review.rating} />
                <p className="text-sm text-[#A1A1AA] leading-relaxed mt-4 mb-6">"{review.comment}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#27272A]">
                  {review.user_picture ? (
                    <img src={review.user_picture} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                      {review.user_name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">{review.user_name}</p>
                    <p className="text-xs text-[#A1A1AA]">Verified Student</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {reviews.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#A1A1AA]">No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
