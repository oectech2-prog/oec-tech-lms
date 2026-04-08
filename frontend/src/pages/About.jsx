import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Eye, Award, Users, BookOpen, Zap, ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
};

export default function About() {
  return (
    <div data-testid="about-page" className="page-transition min-h-screen bg-[#050505]">
      {/* Header */}
      <section className="pt-12 pb-8 border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">About Us</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">OEC Tech Institute</h1>
          <p className="text-base text-[#A1A1AA] max-w-2xl">
            We are on a mission to empower students across Pakistan, UAE, UK & USA with practical digital skills that lead to real income.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Who We Are</h2>
              <p className="text-[#A1A1AA] leading-relaxed mb-4">
                OEC Tech Institute is a leading online learning platform focused on teaching high-income digital skills. We believe that everyone deserves the opportunity to learn, grow, and earn online regardless of their background.
              </p>
              <p className="text-[#A1A1AA] leading-relaxed mb-4">
                Our courses are designed by industry professionals and structured in weekly formats with hands-on assignments, ensuring you don't just learn theory but actually build real-world skills.
              </p>
              <p className="text-[#A1A1AA] leading-relaxed">
                With students from 4 countries and growing, we are building a community of skilled digital professionals who are changing their lives through online earning.
              </p>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <img
              src="https://images.unsplash.com/photo-1758611974775-39e307bc3da9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBzdHVkZW50JTIwbGFwdG9wJTIwbW9kZXJufGVufDB8fHx8MTc3NTU2MjY1Mnww&ixlib=rb-4.1.0&q=85"
              alt="Student learning"
              loading="lazy"
              className="w-full rounded-2xl border border-[#27272A]"
            />
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="bg-[#111111] border border-[#27272A] rounded-2xl p-8"
          >
            <Target className="w-10 h-10 text-[#D4AF37] mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">Our Mission</h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              To provide affordable, practical, and results-driven digital education to students worldwide. We aim to bridge the gap between learning and earning by teaching skills that are in high demand.
            </p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0.1}
            className="bg-[#111111] border border-[#27272A] rounded-2xl p-8"
          >
            <Eye className="w-10 h-10 text-[#D4AF37] mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">Our Vision</h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              To become the #1 online digital skills academy for students in South Asia and the Middle East. We envision a world where anyone with internet access can learn, earn, and thrive in the digital economy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Why Choose Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: 'Practical Learning', desc: 'Every course includes real-world projects and assignments.' },
              { icon: Award, title: 'Diploma Tracks', desc: 'Earn recognized diplomas in complete career paths.' },
              { icon: Users, title: 'Community Support', desc: 'Join active WhatsApp groups and learn with peers.' },
              { icon: Zap, title: 'Weekly Structure', desc: 'Organized modules make learning easy and consistent.' },
              { icon: Target, title: 'Career Focused', desc: 'Skills that directly lead to freelancing and online income.' },
              { icon: Eye, title: 'Lifetime Access', desc: 'Pay once and access course materials forever.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.08}
                className="bg-[#111111] border border-[#27272A] rounded-2xl p-6 hover:border-[#D4AF37]/30 transition-colors"
              >
                <Icon className="w-8 h-8 text-[#D4AF37] mb-3" />
                <h4 className="text-base font-bold text-white mb-2">{title}</h4>
                <p className="text-sm text-[#A1A1AA]">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Start Your Career Today</h2>
          <p className="text-[#A1A1AA] mb-8">Join 2,500+ students already earning online with OEC Tech Institute.</p>
          <Link to="/courses" className="btn-gold px-6 py-2.5 text-sm">
            Browse Courses
          </Link>
        </div>
      </section>
    </div>
  );
}
