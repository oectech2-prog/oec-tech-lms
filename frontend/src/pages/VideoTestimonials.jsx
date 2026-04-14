import { useState, useEffect } from 'react';
import { getVideoTestimonials, submitVideoTestimonial } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';
import { Play, Star, Send, Video, Link2, Youtube, X } from 'lucide-react';

function getYoutubeId(url) {
  const m = url?.match(/(?:embed\/|watch\?v=|youtu\.be\/)([^&?/]+)/);
  return m ? m[1] : null;
}

function getYoutubeThumbnail(url) {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

export default function VideoTestimonials() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [form, setForm] = useState({ video_type: 'youtube', video_url: '', description: '', course_title: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { getVideoTestimonials().then(r => { setVideos(r.data); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.video_url) { toast.error('Video URL is required'); return; }
    setSubmitting(true);
    try {
      await submitVideoTestimonial(form);
      toast.success('Video testimonial submitted for review!');
      setShowSubmit(false);
      setForm({ video_type: 'youtube', video_url: '', description: '', course_title: '' });
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to submit'); }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <main className="pt-4">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_60%)]" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-2 mb-6">
              <Video className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">Video Testimonials</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">Real Students, <span className="bg-gradient-to-r from-[#D4AF37] to-[#FBBF24] bg-clip-text text-transparent">Real Results</span></h1>
            <p className="text-base md:text-lg text-[#A1A1AA] max-w-2xl mx-auto mb-8">Watch our students share their success stories and how OEC Tech Institute helped them start earning online.</p>
            {user && (
              <button data-testid="submit-video-btn" onClick={() => setShowSubmit(true)} className="btn-gold px-6 py-3 text-sm inline-flex items-center gap-2">
                <Send className="w-4 h-4" /> Share Your Story
              </button>
            )}
          </div>
        </section>

        {/* Videos Grid */}
        <section className="py-16" data-testid="video-testimonials-grid">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            {loading ? (
              <div className="flex justify-center py-20"><div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>
            ) : videos.length === 0 ? (
              <div className="text-center py-20">
                <Video className="w-16 h-16 text-[#27272A] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Video Testimonials Yet</h3>
                <p className="text-sm text-[#A1A1AA]">Be the first to share your success story!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videos.map((v, i) => {
                  const thumb = v.thumbnail_url || getYoutubeThumbnail(v.video_url) || '';
                  const isPlaying = playingId === v.testimonial_id;
                  const youtubeId = getYoutubeId(v.video_url);
                  return (
                    <div key={v.testimonial_id} data-testid={`video-card-${v.testimonial_id}`}
                      className="bg-[#111] border border-[#27272A] rounded-2xl overflow-hidden group hover:border-[#D4AF37]/50 transition-all duration-500 hover:-translate-y-2"
                      style={{ animationDelay: `${i * 100}ms`, animation: 'slideUp 0.6s ease-out forwards', opacity: 0 }}>
                      <div className="relative aspect-video bg-[#0A0A0A]">
                        {isPlaying && youtubeId ? (
                          <iframe src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`} title={v.student_name} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
                        ) : isPlaying && v.video_type === 'upload' ? (
                          <video src={v.video_url.startsWith('/api') ? v.video_url : `/api/files/${v.video_url}`} controls autoPlay className="w-full h-full object-contain bg-black" />
                        ) : (
                          <>
                            {thumb ? <img src={thumb} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Video className="w-12 h-12 text-[#27272A]" /></div>}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setPlayingId(v.testimonial_id)} className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                                <Play className="w-7 h-7 text-black ml-1" />
                              </button>
                            </div>
                            {v.video_type === 'youtube' && <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Youtube className="w-3 h-3" />YouTube</div>}
                          </>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                            {v.user_picture ? <img src={v.user_picture} alt="" className="w-full h-full rounded-full object-cover" /> : v.student_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{v.student_name}</p>
                            {v.course_title && <p className="text-[10px] text-[#D4AF37]">{v.course_title}</p>}
                          </div>
                        </div>
                        {v.description && <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-3">"{v.description}"</p>}
                        <div className="flex gap-0.5 mt-3">{[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-[#0A0A0A]">
          <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Write Your Success Story?</h2>
            <p className="text-base text-[#A1A1AA] mb-8">Join thousands of students and start earning online.</p>
            <a href="/courses" className="btn-gold px-6 py-3 text-sm inline-block">Explore Courses</a>
          </div>
        </section>
      </main>
      {/* Submit Modal */}
      {showSubmit && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4" onClick={() => setShowSubmit(false)}>
          <div className="bg-[#111] border border-[#27272A] rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Video className="w-5 h-5 text-[#D4AF37]" /> Submit Video Testimonial</h3>
              <button onClick={() => setShowSubmit(false)} className="text-[#A1A1AA] hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Video Type</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setForm({ ...form, video_type: 'youtube' })} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${form.video_type === 'youtube' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-[#050505] text-[#A1A1AA] border border-[#27272A]'}`}>
                    <Youtube className="w-4 h-4 inline mr-1" /> YouTube Link
                  </button>
                  <button type="button" onClick={() => setForm({ ...form, video_type: 'link' })} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${form.video_type === 'link' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-[#050505] text-[#A1A1AA] border border-[#27272A]'}`}>
                    <Link2 className="w-4 h-4 inline mr-1" /> Video Link
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Video URL *</label>
                <input data-testid="video-url-input" value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} placeholder={form.video_type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://...'} className="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Course Name</label>
                <input value={form.course_title} onChange={e => setForm({ ...form, course_title: e.target.value })} placeholder="Which course did you take?" className="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-medium text-[#A1A1AA] mb-1 block">Your Message</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Share your experience..." className="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none resize-none" />
              </div>
              <button data-testid="submit-testimonial-btn" type="submit" disabled={submitting} className="btn-gold w-full py-3 text-sm">{submitting ? 'Submitting...' : 'Submit Testimonial'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
