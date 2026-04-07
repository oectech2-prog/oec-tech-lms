import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCourses, getReviews, getDiplomaTracks } from '../lib/api';
import { Star, Award, Clock, Users, BookOpen, ArrowRight, CheckCircle2, Zap, Shield, ChevronDown, ChevronUp, Play } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
};

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#27272A]'}`} />
      ))}
    </div>
  );
}

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    getCourses().then(r => setCourses(r.data.slice(0, 6)));
    getReviews().then(r => setReviews(r.data.slice(0, 4)));
    getDiplomaTracks().then(r => setTracks(r.data));
  }, []);

  const faqs = [
    { q: "Who are these courses for?", a: "Our courses are designed for complete beginners who want to learn digital skills and start earning online. No prior experience needed." },
    { q: "Do I get lifetime access?", a: "Yes! Once you enroll and complete payment, you get lifetime access to all course materials, updates, and community support." },
    { q: "What payment methods do you accept?", a: "We accept JazzCash, EasyPaisa, and Bank Transfer. All Pakistan-friendly payment options available." },
    { q: "How long does each course take?", a: "Most courses are 5-6 weeks long with weekly modules. You can learn at your own pace with lifetime access." },
  ];

  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section data-testid="hero-section" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[#050505]">
          <img
            src="https://static.prod-images.emergentagent.com/jobs/9d749137-e5fd-4883-acd9-df8b19d7973e/images/181dbd19bea10b5b1d7eac7fe691687684034e3c99aafdaa79c01fcf422442e7.png"
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/80 to-[#050505]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-32">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl">
            <motion.p variants={fadeUp} custom={0} className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-6">
              Hussnain Digital Academy
            </motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
              Learn High-Income Skills &{' '}
              <span className="text-gold-gradient">Start Earning Online</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-base md:text-lg text-[#A1A1AA] leading-relaxed mb-8 max-w-xl">
              Master in-demand digital skills with practical, weekly-structured courses. Join thousands of students from Pakistan, UAE, UK & USA who are now earning online.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
              <Link to="/courses" data-testid="hero-enroll-btn" className="btn-gold px-8 py-4 text-sm inline-flex items-center gap-2">
                Enroll Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/courses" data-testid="hero-view-courses-btn" className="btn-gold-outline px-8 py-4 text-sm inline-flex items-center gap-2">
                <Play className="w-4 h-4" /> View Courses
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-[#27272A]">
              {[
                { icon: Users, label: '2,500+ Students' },
                { icon: BookOpen, label: '7 Courses' },
                { icon: Award, label: '3 Diplomas' },
                { icon: Clock, label: 'Lifetime Access' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                  <Icon className="w-4 h-4 text-[#D4AF37]" />
                  {label}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Courses */}
      <section data-testid="featured-courses" className="py-24 md:py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Our Courses</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Featured Courses</h2>
            <p className="text-base text-[#A1A1AA] max-w-xl mx-auto">Start your career with our expert-led courses. Practical training, real skills, real income.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, i) => (
              <motion.div key={course.course_id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}>
                <Link to={`/courses/${course.course_id}`} className="course-card block bg-[#111111] border border-[#27272A] rounded-2xl overflow-hidden group">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#1A1A1A]">
                    <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full">
                      {course.level}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-xs text-[#D4AF37] uppercase tracking-wider mb-2">{course.category}</p>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">{course.title}</h3>
                    <p className="text-sm text-[#A1A1AA] mb-4 line-clamp-2">{course.short_description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </div>
                      <span className="text-xl font-bold text-[#D4AF37]">PKR {course.price?.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/courses" data-testid="view-all-courses-btn" className="btn-gold-outline px-8 py-3 text-sm inline-flex items-center gap-2">
              View All Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section data-testid="benefits-section" className="py-24 md:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Why Choose Us</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Why Hussnain Digital Academy?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {[
              { icon: Zap, title: 'Practical Training', desc: 'No boring theory. Learn by doing real projects and assignments every week.', span: 'md:col-span-8' },
              { icon: Clock, title: 'Lifetime Access', desc: 'Pay once, learn forever. All updates included.', span: 'md:col-span-4' },
              { icon: Award, title: 'Diploma Tracks', desc: 'Earn recognized diplomas in Digital Marketing, E-Commerce, and Web Design.', span: 'md:col-span-4' },
              { icon: Shield, title: 'Weekly Structure', desc: 'Organized weekly modules with lessons, assignments, and final projects.', span: 'md:col-span-4' },
              { icon: Users, title: 'Community Support', desc: 'Join our WhatsApp groups and learn together with thousands of students.', span: 'md:col-span-4' },
            ].map(({ icon: Icon, title, desc, span }, i) => (
              <motion.div key={title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1} className={span}>
                <div className="h-full bg-[#111111] border border-[#27272A] rounded-2xl p-8 hover:border-[#D4AF37]/30 transition-colors">
                  <Icon className="w-10 h-10 text-[#D4AF37] mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Diploma Tracks */}
      {tracks.length > 0 && (
        <section data-testid="diploma-tracks-preview" className="py-24 md:py-32 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Career Paths</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Diploma Tracks</h2>
              <p className="text-base text-[#A1A1AA] max-w-xl mx-auto">Complete structured career paths and earn your diploma.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tracks.map((track, i) => (
                <motion.div key={track.track_id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.15}>
                  <Link to={`/diploma-tracks`} className="block bg-[#111111] border border-[#27272A] rounded-2xl p-8 hover:border-[#D4AF37]/50 transition-all hover:-translate-y-1">
                    <Award className="w-10 h-10 text-[#D4AF37] mb-4" />
                    <h3 className="text-xl font-bold text-white mb-3">{track.title}</h3>
                    <p className="text-sm text-[#A1A1AA] mb-4 line-clamp-2">{track.description}</p>
                    <div className="flex items-center gap-2 text-sm text-[#D4AF37]">
                      {track.courses?.length} courses <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Preview */}
      {reviews.length > 0 && (
        <section data-testid="reviews-preview" className="py-24 md:py-32 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Success Stories</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">What Our Students Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.map((review, i) => (
                <motion.div key={review.review_id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}
                  className="bg-[#111111] border border-[#27272A] rounded-2xl p-8"
                >
                  <StarRating rating={review.rating} />
                  <p className="text-[#A1A1AA] text-sm leading-relaxed mt-4 mb-6">"{review.comment}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold">
                      {review.user_name?.charAt(0)}
                    </div>
                    <span className="text-white font-medium text-sm">{review.user_name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/reviews" data-testid="view-all-reviews-btn" className="btn-gold-outline px-8 py-3 text-sm inline-flex items-center gap-2">
                View All Reviews <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section data-testid="cta-section" className="py-24 md:py-32 bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 via-transparent to-[#D4AF37]/5" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Limited Seats Available</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Start Your Career Today</h2>
          <p className="text-base text-[#A1A1AA] mb-8 leading-relaxed">
            Don't wait. Join 2,500+ students who are already earning online with real digital skills. Lifetime access, practical training, weekly assignments.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/courses" data-testid="cta-enroll-btn" className="btn-gold px-8 py-4 text-sm inline-flex items-center gap-2">
              Enroll Now <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" data-testid="cta-whatsapp-btn" className="btn-gold-outline px-8 py-4 text-sm inline-flex items-center gap-2">
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section data-testid="faq-preview" className="py-24 md:py-32 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Common Questions</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#111111] border border-[#27272A] rounded-xl overflow-hidden">
                <button
                  data-testid={`faq-toggle-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-[#D4AF37]" /> : <ChevronDown className="w-5 h-5 text-[#A1A1AA]" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-[#A1A1AA] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/faq" className="text-sm text-[#D4AF37] hover:text-[#FBBF24] transition-colors inline-flex items-center gap-1">
              View All FAQs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
