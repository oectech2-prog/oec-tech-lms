import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCourses } from '../lib/api';
import { Clock, ArrowRight, BookOpen, Search, ShoppingCart } from 'lucide-react';
import { Input } from '../components/ui/input';

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: (i = 0) => ({ opacity: 1, scale: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] } })
};

const CATEGORIES = ['All', 'Technology', 'Design', 'Marketing', 'E-Commerce', 'Web Development'];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    getCourses().then(r => setCourses(r.data));
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.short_description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || c.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="page-transition min-h-screen bg-[#050505]">
      {/* Hero */}
      <section className="pt-12 pb-8 border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Our Courses</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">All Courses</h1>
          <p className="text-base text-[#A1A1AA] max-w-xl mb-8">Choose from our expert-led courses and start your journey to earning online.</p>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
              <Input
                data-testid="course-search"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#111111] border-[#27272A] text-white placeholder:text-[#A1A1AA] focus:border-[#D4AF37] focus:ring-[#D4AF37]"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  data-testid={`filter-${cat.toLowerCase()}`}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                    category === cat
                      ? 'bg-[#D4AF37] text-black'
                      : 'bg-[#111111] text-[#A1A1AA] border border-[#27272A] hover:border-[#D4AF37]/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-[#27272A] mx-auto mb-4" />
              <p className="text-[#A1A1AA]">No courses found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((course, i) => (
                <motion.div key={course.course_id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i * 0.08}>
                  <Link to={`/courses/${course.course_id}`} data-testid={`course-card-${course.course_id}`} className="course-card block bg-[#111111] border border-[#27272A] rounded-2xl overflow-hidden group">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#1A1A1A]">
                      <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                        {course.category}
                      </div>
                      <div className="absolute top-3 right-3 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full">
                        {course.level}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">{course.title}</h3>
                      <p className="text-sm text-[#A1A1AA] mb-4 line-clamp-2">{course.short_description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-xs text-[#A1A1AA]">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {course.weeks?.length || 0} weeks</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-[#27272A]">
                        <div>
                          <span className="text-xl font-bold text-[#D4AF37]">PKR {course.price?.toLocaleString()}</span>
                          {course.admission_fee > 0 && (
                            <span className="text-[10px] text-[#A1A1AA] block">+ PKR {course.admission_fee?.toLocaleString()} admission</span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-[#D4AF37] flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Details <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                      <Link
                        to={`/checkout/${course.course_id}`}
                        data-testid={`enroll-btn-${course.course_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="btn-gold w-full text-center mt-4 py-2.5 text-sm font-bold inline-flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" /> Enroll Now
                      </Link>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
