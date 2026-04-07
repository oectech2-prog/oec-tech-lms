import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getReviews } from '../lib/api';
import { Star, Quote, Filter } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';

const FLAGS = {
  PK: { emoji: 'PK', name: 'Pakistan', color: 'bg-green-600' },
  AE: { emoji: 'AE', name: 'UAE', color: 'bg-red-500' },
  GB: { emoji: 'GB', name: 'United Kingdom', color: 'bg-blue-600' },
  US: { emoji: 'US', name: 'United States', color: 'bg-blue-700' },
};

function CountryBadge({ code }) {
  const flag = FLAGS[code] || { emoji: code, name: code, color: 'bg-gray-600' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${flag.color}/20 border border-current/20`}>
      <span className={`w-3 h-3 rounded-full ${flag.color}`} />
      {flag.name}
    </span>
  );
}

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#27272A]'}`} />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="h-full bg-[#111111] border border-[#27272A] rounded-2xl p-6 hover:border-[#D4AF37]/30 transition-all duration-500 hover:-translate-y-1 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <StarRating rating={review.rating} />
        <CountryBadge code={review.user_country} />
      </div>
      <p className="text-sm text-[#A1A1AA] leading-relaxed flex-1 italic">"{review.comment}"</p>
      <div className="flex items-center gap-3 pt-4 mt-4 border-t border-[#27272A]">
        <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-xs">
          {review.user_name?.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{review.user_name}</p>
          <p className="text-[10px] text-[#A1A1AA]">Verified Student</p>
        </div>
      </div>
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getReviews().then(r => setReviews(r.data));
  }, []);

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.user_country === filter);
  const countByCountry = {
    all: reviews.length,
    PK: reviews.filter(r => r.user_country === 'PK').length,
    AE: reviews.filter(r => r.user_country === 'AE').length,
    GB: reviews.filter(r => r.user_country === 'GB').length,
    US: reviews.filter(r => r.user_country === 'US').length,
  };

  return (
    <div data-testid="reviews-page" className="page-transition min-h-screen bg-[#050505]">
      <section className="pt-12 pb-8 border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Testimonials</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Student Reviews</h1>
          <p className="text-base text-[#A1A1AA] max-w-xl mb-6">
            {reviews.length}+ students sharing their success stories from around the world.
          </p>

          {/* Country Filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Reviews' },
              { key: 'PK', label: 'Pakistan' },
              { key: 'AE', label: 'UAE' },
              { key: 'GB', label: 'UK' },
              { key: 'US', label: 'USA' },
            ].map(({ key, label }) => (
              <button
                key={key}
                data-testid={`filter-country-${key}`}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  filter === key
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-[#111111] text-[#A1A1AA] border border-[#27272A] hover:border-[#D4AF37]/50'
                }`}
              >
                {label} ({countByCountry[key] || 0})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Carousel */}
      <section className="py-10 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-lg font-bold text-white mb-6">Featured Reviews</h2>
          <Swiper
            modules={[Autoplay, Pagination, FreeMode]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true, bulletClass: 'swiper-pagination-bullet !bg-[#D4AF37]', bulletActiveClass: 'swiper-pagination-bullet-active !bg-[#D4AF37]' }}
            freeMode
            className="pb-12"
          >
            {reviews.filter(r => r.rating === 5).slice(0, 12).map((review) => (
              <SwiperSlide key={review.review_id} className="h-auto">
                <ReviewCard review={review} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* All Reviews Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-lg font-bold text-white mb-6">All Reviews ({filtered.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((review, i) => (
              <motion.div
                key={review.review_id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
              >
                <ReviewCard review={review} />
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#A1A1AA]">No reviews found for this filter.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
