import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getCourses, getReviews, getDiplomaTracks } from '../lib/api';
import { Star, Award, Clock, Users, BookOpen, ArrowRight, CheckCircle2, Zap, Shield, ChevronDown, ChevronUp, Play, Sparkles, TrendingUp, Globe } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] } })
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i = 0) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] } })
};

const slideRight = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const slideLeft = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
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

function AnimatedCounter({ target, duration = 2 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count.toLocaleString()}</>;
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
    { q: "What payment methods do you accept?", a: "We accept JazzCash, EasyPaisa, and Bank Transfer. Upload your fee receipt and our admin will verify within 24 hours." },
    { q: "How long does each course take?", a: "Most courses are 5-6 weeks long with weekly modules. You can learn at your own pace with lifetime access." },
  ];

  return (
    <div className="page-transition overflow-hidden">
      {/* Hero Section - Split Layout with 3D Image */}
      <section data-testid="hero-section" className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-[#050505]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.08),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.04),transparent_50%)]" />
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#D4AF37]/30 rounded-full"
              style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <motion.div initial="hidden" animate="visible">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">OEC Tech Institute</span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
                Learn High-Income Skills &{' '}
                <span className="text-gold-gradient">Start Earning Online</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="text-base md:text-lg text-[#A1A1AA] leading-relaxed mb-8 max-w-xl">
                Master in-demand digital skills with practical, weekly-structured courses. Join thousands of students from Pakistan, UAE, UK & USA who are now earning online.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4 mb-10">
                <Link to="/courses" data-testid="hero-enroll-btn" className="btn-gold px-8 py-4 text-sm inline-flex items-center gap-2 group">
                  Enroll Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/courses" data-testid="hero-view-courses-btn" className="btn-gold-outline px-8 py-4 text-sm inline-flex items-center gap-2 group">
                  <Play className="w-4 h-4 group-hover:scale-110 transition-transform" /> View Courses
                </Link>
              </motion.div>

              {/* Stats Row */}
              <motion.div variants={fadeUp} custom={4} className="grid grid-cols-4 gap-4 pt-8 border-t border-[#27272A]">
                {[
                  { value: 2500, suffix: '+', label: 'Students' },
                  { value: 7, suffix: '', label: 'Courses' },
                  { value: 3, suffix: '', label: 'Diplomas' },
                  { value: 95, suffix: '%', label: 'Success Rate' },
                ].map(({ value, suffix, label }) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl font-bold text-[#D4AF37]">
                      <AnimatedCounter target={value} />{suffix}
                    </p>
                    <p className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-1">{label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - 3D Animated Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              {/* Glow rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-[400px] h-[400px] rounded-full border border-[#D4AF37]/10" />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-[480px] h-[480px] rounded-full border border-[#D4AF37]/5 border-dashed" />
              </motion.div>

              {/* 3D Image */}
              <motion.div
                animate={{ y: [-12, 12, -12] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <img
                  src="https://static.prod-images.emergentagent.com/jobs/9d749137-e5fd-4883-acd9-df8b19d7973e/images/ae3c6654a4654a0ca0c8dc38f24e04b047b0b5460528ae9d5babb12e845cd333.png"
                  alt="3D Tech Education"
                  loading="eager"
                  className="w-full max-w-[500px] mx-auto drop-shadow-[0_20px_60px_rgba(212,175,55,0.15)]"
                />
              </motion.div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [-8, 8, -8], x: [-4, 4, -4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-0 glass-panel rounded-xl px-4 py-3 z-20"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-[10px] text-[#A1A1AA]">Earning Potential</p>
                    <p className="text-sm font-bold text-white">$500-$2000/mo</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [8, -8, 8], x: [4, -4, 4] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-20 left-0 glass-panel rounded-xl px-4 py-3 z-20"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <p className="text-[10px] text-[#A1A1AA]">Students from</p>
                    <p className="text-sm font-bold text-white">4 Countries</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trusted By / Features Strip */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-8 bg-[#0A0A0A] border-y border-[#27272A]"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap justify-center gap-8 md:gap-16">
          {[
            { icon: Shield, text: 'Secure Payments' },
            { icon: Clock, text: 'Lifetime Access' },
            { icon: Award, text: 'Certified Diplomas' },
            { icon: Zap, text: 'Practical Training' },
            { icon: Users, text: 'Community Support' },
          ].map(({ icon: Icon, text }, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 text-sm text-[#A1A1AA]"
            >
              <Icon className="w-4 h-4 text-[#D4AF37]" />
              {text}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Featured Courses */}
      <section data-testid="featured-courses" className="py-24 md:py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Our Courses</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold text-white mb-4">Featured Courses</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-base text-[#A1A1AA] max-w-xl mx-auto">Start your career with our expert-led courses. Practical training, real skills, real income.</motion.p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, i) => (
              <motion.div key={course.course_id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i * 0.1}>
                <Link to={`/courses/${course.course_id}`} className="course-card block bg-[#111111] border border-[#27272A] rounded-2xl overflow-hidden group">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#1A1A1A]">
                    <img src={course.image_url} alt={course.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 right-3 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full">
                      {course.level}
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">{course.category}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors duration-300">{course.title}</h3>
                    <p className="text-sm text-[#A1A1AA] mb-4 line-clamp-2">{course.short_description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-[#27272A]">
                      <div className="flex items-center gap-3 text-xs text-[#A1A1AA]">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                        <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {course.weeks?.length || 0}W</span>
                      </div>
                      <span className="text-xl font-bold text-[#D4AF37]">PKR {course.price?.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-12">
            <Link to="/courses" data-testid="view-all-courses-btn" className="btn-gold-outline px-8 py-3 text-sm inline-flex items-center gap-2 group">
              View All Courses <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits - Bento Grid */}
      <section data-testid="benefits-section" className="py-24 md:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Why Choose Us</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold text-white">Why OEC Tech Institute?</motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {[
              { icon: Zap, title: 'Practical Training', desc: 'No boring theory. Learn by doing real projects and assignments every week. Build a portfolio while you learn.', span: 'md:col-span-8', gradient: 'from-yellow-500/5' },
              { icon: Clock, title: 'Lifetime Access', desc: 'Pay once, learn forever. All updates included.', span: 'md:col-span-4', gradient: 'from-blue-500/5' },
              { icon: Award, title: 'Diploma Tracks', desc: 'Earn recognized diplomas in Digital Marketing, E-Commerce, and Web Design.', span: 'md:col-span-4', gradient: 'from-purple-500/5' },
              { icon: Shield, title: 'Weekly Structure', desc: 'Organized weekly modules with lessons, assignments, and final projects.', span: 'md:col-span-4', gradient: 'from-green-500/5' },
              { icon: Users, title: 'Community Support', desc: 'Join our WhatsApp groups and learn with thousands of students.', span: 'md:col-span-4', gradient: 'from-pink-500/5' },
            ].map(({ icon: Icon, title, desc, span, gradient }, i) => (
              <motion.div key={title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i * 0.1} className={span}>
                <div className={`h-full bg-[#111111] bg-gradient-to-br ${gradient} to-transparent border border-[#27272A] rounded-2xl p-8 hover:border-[#D4AF37]/30 transition-all duration-500 group hover:-translate-y-1`}>
                  <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
                    <Icon className="w-10 h-10 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform duration-300" />
                  </motion.div>
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
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
              <motion.p variants={fadeUp} className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Career Paths</motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold text-white mb-4">Diploma Tracks</motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-base text-[#A1A1AA] max-w-xl mx-auto">Complete structured career paths and earn your diploma.</motion.p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tracks.map((track, i) => (
                <motion.div key={track.track_id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i * 0.15}>
                  <Link to={`/diploma-tracks`} className="block bg-[#111111] border border-[#27272A] rounded-2xl p-8 hover:border-[#D4AF37]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] group">
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <Award className="w-10 h-10 text-[#D4AF37] mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#D4AF37] transition-colors">{track.title}</h3>
                    <p className="text-sm text-[#A1A1AA] mb-4 line-clamp-2">{track.description}</p>
                    <div className="flex items-center gap-2 text-sm text-[#D4AF37]">
                      {track.courses?.length} courses <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews with enhanced animation */}
      {reviews.length > 0 && (
        <section data-testid="reviews-preview" className="py-24 md:py-32 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
              <motion.p variants={fadeUp} className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Success Stories</motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold text-white mb-4">What Our Students Say</motion.h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.map((review, i) => (
                <motion.div
                  key={review.review_id}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={i % 2 === 0 ? slideRight : slideLeft}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#111111] border border-[#27272A] rounded-2xl p-8 hover:border-[#D4AF37]/30 transition-colors duration-300"
                >
                  <StarRating rating={review.rating} />
                  <p className="text-[#A1A1AA] text-sm leading-relaxed mt-4 mb-6 italic">"{review.comment}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#27272A]">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold">
                      {review.user_name?.charAt(0)}
                    </div>
                    <div>
                      <span className="text-white font-medium text-sm block">{review.user_name}</span>
                      <span className="text-[#A1A1AA] text-xs">Verified Student</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
              <Link to="/reviews" data-testid="view-all-reviews-btn" className="btn-gold-outline px-8 py-3 text-sm inline-flex items-center gap-2 group">
                View All Reviews <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section - Enhanced */}
      <section data-testid="cta-section" className="py-24 md:py-32 bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06),transparent_70%)]" />
        </div>
        {/* Animated rings */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#D4AF37]/10"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-[#D4AF37]/5"
        />

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 text-center">
          <motion.div variants={scaleIn}>
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Limited Seats Available</span>
            </div>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold text-white mb-6">Start Your Career Today</motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-base text-[#A1A1AA] mb-8 leading-relaxed">
            Don't wait. Join 2,500+ students who are already earning online with real digital skills. Lifetime access, practical training, weekly assignments.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="flex flex-wrap justify-center gap-4">
            <Link to="/courses" data-testid="cta-enroll-btn" className="btn-gold px-8 py-4 text-sm inline-flex items-center gap-2 group animate-gold-pulse">
              Enroll Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" data-testid="cta-whatsapp-btn" className="btn-gold-outline px-8 py-4 text-sm inline-flex items-center gap-2">
              Ask on WhatsApp
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Location Map */}
      <section data-testid="location-section" className="py-24 md:py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Find Us</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Location</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-base text-[#A1A1AA] max-w-xl mx-auto">Visit OEC Tech Institute in Chunian or reach out online — we serve students globally.</motion.p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden border border-[#27272A]"
          >
            <iframe
              data-testid="home-map-iframe"
              src="https://www.google.com/maps?q=OEC+Tech+Institute+Chunian&output=embed"
              width="100%"
              height="400"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.95) contrast(0.9)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="OEC Tech Institute Location"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-6">
            <a
              href="https://maps.app.goo.gl/ateRRsVJD3z4GRTX8"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="home-map-directions-link"
              className="text-sm text-[#D4AF37] hover:text-[#FBBF24] transition-colors inline-flex items-center gap-1 group"
            >
              Get Directions <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section data-testid="faq-preview" className="py-24 md:py-32 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Common Questions</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold text-white">Frequently Asked Questions</motion.h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#111111] border border-[#27272A] rounded-xl overflow-hidden hover:border-[#D4AF37]/20 transition-colors"
              >
                <button
                  data-testid={`faq-toggle-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className={`w-5 h-5 ${openFaq === i ? 'text-[#D4AF37]' : 'text-[#A1A1AA]'}`} />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5">
                    <p className="text-sm text-[#A1A1AA] leading-relaxed">{faq.a}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-8">
            <Link to="/faq" className="text-sm text-[#D4AF37] hover:text-[#FBBF24] transition-colors inline-flex items-center gap-1 group">
              View All FAQs <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
