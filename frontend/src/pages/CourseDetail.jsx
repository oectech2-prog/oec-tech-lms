import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCourse } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Clock, BookOpen, Award, User, CheckCircle2, ChevronDown, ChevronUp, Play, Lock, FileText, ArrowRight } from 'lucide-react';

export default function CourseDetail() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openWeek, setOpenWeek] = useState(0);

  useEffect(() => {
    getCourse(courseId).then(r => { setCourse(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [courseId]);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!course) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Course Not Found</h2>
        <Link to="/courses" className="btn-gold px-6 py-3 text-sm">Browse Courses</Link>
      </div>
    </div>
  );

  const totalLessons = course.weeks?.reduce((acc, w) => acc + (w.lessons?.length || 0), 0) || 0;
  const totalAssignments = course.weeks?.filter(w => w.assignment).length || 0;

  return (
    <div data-testid="course-detail-page" className="page-transition min-h-screen bg-[#050505]">
      {/* Course Header */}
      <section className="pt-8 pb-12 border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left - Info */}
            <div className="lg:col-span-3">
              <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">{course.category}</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{course.title}</h1>
              <p className="text-base text-[#A1A1AA] leading-relaxed mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-4 mb-6">
                {[
                  { icon: Clock, text: course.duration },
                  { icon: Award, text: course.level },
                  { icon: BookOpen, text: `${totalLessons} Lessons` },
                  { icon: FileText, text: `${totalAssignments} Assignments` },
                  { icon: User, text: course.instructor },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-[#A1A1AA] bg-[#111111] px-4 py-2 rounded-full border border-[#27272A]">
                    <Icon className="w-4 h-4 text-[#D4AF37]" />
                    {text}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <span className="text-3xl font-bold text-[#D4AF37]">PKR {course.price?.toLocaleString()}</span>
                  {course.admission_fee > 0 && (
                    <span className="text-xs text-[#A1A1AA] block mt-1">+ PKR {course.admission_fee?.toLocaleString()} admission fee</span>
                  )}
                </div>
                <Link
                  to={user ? `/checkout/${course.course_id}` : '/login'}
                  data-testid="enroll-course-btn"
                  className="btn-gold px-6 py-2.5 text-sm"
                >
                  Enroll Now
                </Link>
              </div>
            </div>

            {/* Right - Intro Video */}
            <div className="lg:col-span-2">
              {course.intro_video_url ? (
                <div className="video-theater rounded-2xl overflow-hidden border border-[#27272A]">
                  <iframe
                    src={course.intro_video_url}
                    title="Course Preview"
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video bg-[#111111] rounded-2xl border border-[#27272A] flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-12 h-12 text-[#D4AF37] mx-auto mb-2" />
                    <p className="text-sm text-[#A1A1AA]">Preview Coming Soon</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Requirements & What You'll Learn */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Requirements */}
          <div className="bg-[#111111] border border-[#27272A] rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Requirements</h3>
            <ul className="space-y-3">
              {course.requirements?.map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#A1A1AA]">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* What You'll Learn */}
          <div className="bg-[#111111] border border-[#27272A] rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">What You Will Learn</h3>
            <ul className="space-y-3">
              {course.what_you_will_learn?.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#A1A1AA]">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Weekly Course Outline */}
      <section data-testid="weekly-outline" className="py-16 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Course Content</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Weekly Course Outline</h2>
          </div>

          <div className="space-y-4 week-timeline pl-4">
            {course.weeks?.map((week, i) => (
              <motion.div
                key={week.week_number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {/* Timeline dot */}
                <div className={`absolute -left-4 top-5 w-[10px] h-[10px] rounded-full z-10 ${
                  week.assignment?.is_final_project ? 'bg-[#FBBF24] animate-gold-pulse' : 'bg-[#D4AF37]'
                }`} />

                <div className="ml-4 bg-[#111111] border border-[#27272A] rounded-xl overflow-hidden">
                  <button
                    data-testid={`week-toggle-${week.week_number}`}
                    onClick={() => setOpenWeek(openWeek === i ? -1 : i)}
                    className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        week.assignment?.is_final_project
                          ? 'bg-[#D4AF37] text-black'
                          : 'bg-[#D4AF37]/10 text-[#D4AF37]'
                      }`}>
                        {week.assignment?.is_final_project ? 'Final' : `Week ${week.week_number}`}
                      </span>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-white">{week.title}</h4>
                        <p className="text-xs text-[#A1A1AA]">{week.lessons?.length || 0} lessons{week.assignment ? ' + 1 assignment' : ''}</p>
                      </div>
                    </div>
                    {openWeek === i ? <ChevronUp className="w-5 h-5 text-[#D4AF37]" /> : <ChevronDown className="w-5 h-5 text-[#A1A1AA]" />}
                  </button>

                  {openWeek === i && (
                    <div className="px-6 pb-5 space-y-2">
                      {week.description && <p className="text-xs text-[#A1A1AA] mb-3">{week.description}</p>}

                      {/* Lessons */}
                      {week.lessons?.map((lesson) => (
                        <div key={lesson.lesson_id} className="flex items-center gap-3 py-2 px-4 bg-[#0A0A0A] rounded-lg">
                          <Lock className="w-4 h-4 text-[#A1A1AA]" />
                          <div className="flex-1">
                            <p className="text-sm text-[#A1A1AA]">{lesson.title}</p>
                          </div>
                          <span className="text-xs text-[#A1A1AA]">{lesson.duration}</span>
                        </div>
                      ))}

                      {/* Assignment */}
                      {week.assignment && (
                        <div className={`flex items-center gap-3 py-2 px-4 rounded-lg ${
                          week.assignment.is_final_project ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30' : 'bg-[#0A0A0A]'
                        }`}>
                          <FileText className={`w-4 h-4 ${week.assignment.is_final_project ? 'text-[#D4AF37]' : 'text-[#A1A1AA]'}`} />
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${week.assignment.is_final_project ? 'text-[#D4AF37]' : 'text-[#A1A1AA]'}`}>
                              {week.assignment.title}
                            </p>
                            <p className="text-xs text-[#A1A1AA] mt-1">{week.assignment.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enroll CTA */}
      <section className="py-24 bg-[#050505]">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-base text-[#A1A1AA] mb-8">
            Enroll now and get lifetime access to all course materials, assignments, and community support.
          </p>
          <Link
            to={user ? `/checkout/${course.course_id}` : '/login'}
            data-testid="enroll-bottom-btn"
            className="btn-gold px-6 py-2.5 text-sm"
          >
            Enroll for PKR {course.price?.toLocaleString()}
          </Link>
        </div>
      </section>
    </div>
  );
}
