import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getDiplomaTracks, getCourses } from '../lib/api';
import { Award, ArrowRight, CheckCircle2, BookOpen, ShoppingCart } from 'lucide-react';

export default function DiplomaTracks() {
  const [tracks, setTracks] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    getDiplomaTracks().then(r => setTracks(r.data));
    getCourses().then(r => setCourses(r.data));
  }, []);

  const getCourseName = (courseId) => courses.find(c => c.course_id === courseId)?.title || courseId;
  const getCourseObj = (courseId) => courses.find(c => c.course_id === courseId);

  const getTrackTotal = (track) => {
    return (track.courses || []).reduce((sum, cId) => {
      const c = getCourseObj(cId);
      return sum + (c?.price || 0) + (c?.admission_fee || 0);
    }, 0);
  };

  return (
    <div data-testid="diploma-tracks-page" className="page-transition min-h-screen bg-[#050505]">
      <section className="pt-12 pb-8 border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Career Paths</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Diploma Tracks</h1>
          <p className="text-base text-[#A1A1AA] max-w-xl">
            Follow structured career paths to master complete skill sets. Earn your diploma and start your career.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
          {tracks.map((track, idx) => {
            const totalPrice = getTrackTotal(track);
            return (
              <motion.div
                key={track.track_id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="bg-[#111111] border border-[#27272A] rounded-2xl overflow-hidden"
              >
                {/* Track Header */}
                <div className="p-8 md:p-10 border-b border-[#27272A]">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Award className="w-7 h-7 text-[#D4AF37]" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">{track.title}</h2>
                      <p className="text-sm text-[#A1A1AA] leading-relaxed">{track.description}</p>
                    </div>
                    <div className="hidden md:block text-right shrink-0">
                      <p className="text-xs text-[#A1A1AA] mb-1">Total Investment</p>
                      <p className="text-2xl font-bold text-[#D4AF37]" data-testid={`track-total-${track.track_id}`}>PKR {totalPrice.toLocaleString()}</p>
                      <p className="text-[10px] text-[#A1A1AA]">{track.courses?.length || 0} courses included</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Roadmap + Courses */}
                  <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-[#27272A]">
                    <h3 className="text-lg font-bold text-white mb-6">Roadmap</h3>
                    <div className="space-y-4">
                      {track.roadmap?.map((step) => (
                        <div key={step.step} className="flex gap-4">
                          <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-full flex items-center justify-center shrink-0 text-[#D4AF37] text-sm font-bold">
                            {step.step}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{step.title}</h4>
                            <p className="text-xs text-[#A1A1AA]">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Courses in Track */}
                    <div className="mt-8 space-y-3">
                      <h4 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider">Included Courses</h4>
                      {track.courses?.map((cId) => {
                        const c = getCourseObj(cId);
                        return (
                          <Link key={cId} to={`/courses/${cId}`} className="flex items-center gap-3 p-3 bg-[#0A0A0A] rounded-lg hover:bg-white/5 transition-colors group">
                            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                            <span className="text-sm text-[#A1A1AA] group-hover:text-white flex-1">{getCourseName(cId)}</span>
                            <div className="text-right">
                              <span className="text-xs text-[#D4AF37] block">PKR {(c?.price || 0).toLocaleString()}</span>
                              {c?.admission_fee > 0 && (
                                <span className="text-[10px] text-[#A1A1AA]">+ {c.admission_fee.toLocaleString()} adm.</span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Outcomes + CTA */}
                  <div className="p-8 md:p-10">
                    <h3 className="text-lg font-bold text-white mb-6">Career Outcomes</h3>
                    <ul className="space-y-4">
                      {track.outcomes?.map((outcome, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span className="text-sm text-[#A1A1AA]">{outcome}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Price summary on mobile */}
                    <div className="md:hidden mt-6 p-4 bg-[#0A0A0A] rounded-xl border border-[#27272A]">
                      <p className="text-xs text-[#A1A1AA] mb-1">Total Investment</p>
                      <p className="text-2xl font-bold text-[#D4AF37]">PKR {totalPrice.toLocaleString()}</p>
                      <p className="text-[10px] text-[#A1A1AA]">{track.courses?.length || 0} courses included</p>
                    </div>

                    <div className="mt-8">
                      <Link
                        to={`/checkout/track/${track.track_id}`}
                        data-testid={`track-enroll-${track.track_id}`}
                        className="btn-gold px-5 py-2.5 text-sm"
                      >
                        Start This Track
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
