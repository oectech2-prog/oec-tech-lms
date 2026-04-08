import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMyCourses, updateProgress, submitAssignment, getSubmissions, studentUpload } from '../lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Play, CheckCircle2, Circle, FileText, Lock, ChevronDown, ChevronUp, Send, Upload, Link2, MessageSquare, FileImage, X, Clock, AlertCircle } from 'lucide-react';
import { Progress } from '../components/ui/progress';

export default function MyCourseView() {
  const { enrollmentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(0);
  const [activeLesson, setActiveLesson] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  // Assignment form
  const [subType, setSubType] = useState('text');
  const [subText, setSubText] = useState('');
  const [subLink, setSubLink] = useState('');
  const [subFile, setSubFile] = useState(null);
  const [subFilePreview, setSubFilePreview] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const res = await getMyCourses();
      const found = res.data.find(e => e.enrollment.enrollment_id === enrollmentId);
      if (found) {
        setData(found);
        const approvedWeeks = found.enrollment.approved_weeks || [];
        // Open first unlocked week
        const weeks = found.course.weeks || [];
        let openWeek = 0;
        for (let i = 0; i < weeks.length; i++) {
          if (i === 0 || approvedWeeks.includes(i)) { openWeek = i; } else break;
        }
        setActiveWeek(openWeek);
        if (weeks[openWeek]?.lessons?.length > 0) setActiveLesson(weeks[openWeek].lessons[0]);
      }
      const subRes = await getSubmissions(enrollmentId);
      setSubmissions(subRes.data);
    } catch { toast.error('Failed to load course data'); }
    setLoading(false);
  }, [enrollmentId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLessonComplete = async (lessonId, completed) => {
    try {
      const res = await updateProgress(enrollmentId, { lesson_id: lessonId, completed });
      setData(prev => ({ ...prev, enrollment: { ...prev.enrollment, progress: res.data.progress, completed_lessons: res.data.completed_lessons } }));
      toast.success(completed ? 'Lesson completed!' : 'Lesson unmarked');
    } catch { toast.error('Failed to update progress'); }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Max 10MB'); return; }
    setSubFile(file);
    setSubFilePreview(file.name);
  };

  const handleSubmitAssignment = async (assignmentId) => {
    if (subType === 'text' && !subText.trim()) { toast.error('Please write your answer'); return; }
    if (subType === 'link' && !subLink.trim()) { toast.error('Please enter a link'); return; }
    if (subType === 'file' && !subFile) { toast.error('Please upload a file'); return; }
    setSubmitting(true);
    try {
      let fileUrl = '';
      let content = '';
      if (subType === 'file' && subFile) {
        const uploadRes = await studentUpload(subFile);
        fileUrl = uploadRes.data.url;
        content = `[File: ${subFile.name}]`;
      } else if (subType === 'link') {
        content = subLink.trim();
      } else {
        content = subText.trim();
      }
      await submitAssignment(enrollmentId, { assignment_id: assignmentId, content, file_url: fileUrl, submission_type: subType });
      toast.success('Assignment submitted! Waiting for admin approval.');
      setSubText(''); setSubLink(''); setSubFile(null); setSubFilePreview(null);
      const subRes = await getSubmissions(enrollmentId);
      setSubmissions(subRes.data);
      setData(prev => ({ ...prev, enrollment: { ...prev.enrollment, submitted_assignments: [...(prev.enrollment.submitted_assignments || []), assignmentId] } }));
    } catch { toast.error('Failed to submit assignment'); }
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="text-center"><h2 className="text-xl font-bold text-white mb-4">Course Not Found</h2><Link to="/dashboard" className="btn-gold px-6 py-3 text-sm">Back to Dashboard</Link></div></div>;

  const { enrollment, course } = data;
  const isLocked = enrollment.payment_status !== 'completed';
  const completedLessons = enrollment.completed_lessons || [];
  const submittedAssignments = enrollment.submitted_assignments || [];
  const approvedWeeks = enrollment.approved_weeks || [];
  const totalWeeks = course.weeks?.length || 1;
  const weeklyProgress = Math.round((approvedWeeks.length / totalWeeks) * 100);

  const isWeekUnlocked = (weekIndex) => {
    if (weekIndex === 0) return true;
    return approvedWeeks.includes(weekIndex);
  };

  const getWeekAssignmentStatus = (weekIndex) => {
    const week = course.weeks?.[weekIndex];
    if (!week?.assignment) return null;
    const sub = submissions.find(s => s.assignment_id === week.assignment.assignment_id);
    if (!sub) return null;
    return sub.status;
  };

  const getVideoEmbed = (lesson) => {
    if (!lesson?.video_url) return null;
    if (lesson.video_type === 'youtube' || lesson.video_url.includes('youtube')) {
      return <iframe src={lesson.video_url} title={lesson.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
    }
    if (lesson.video_type === 'vimeo' || lesson.video_url.includes('vimeo')) {
      return <iframe src={lesson.video_url} title={lesson.title} className="w-full h-full" allowFullScreen />;
    }
    return <video src={lesson.video_url} controls className="w-full h-full" />;
  };

  return (
    <div data-testid="course-learning-view" className="min-h-screen bg-[#050505] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 xl:w-96 bg-[#0A0A0A] border-b lg:border-b-0 lg:border-r border-[#27272A] lg:h-screen lg:overflow-y-auto">
        <div className="p-4 border-b border-[#27272A]">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-3"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</Link>
          <h2 className="text-base font-bold text-white">{course.title}</h2>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-[#A1A1AA] mb-1"><span>Lesson Progress</span><span>{enrollment.progress}%</span></div>
            <Progress value={enrollment.progress} className="h-2 bg-[#27272A]" />
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-[#A1A1AA] mb-1"><span>Weekly Progress</span><span data-testid="weekly-progress-pct">{weeklyProgress}%</span></div>
            <Progress value={weeklyProgress} className="h-2 bg-[#27272A]" />
            <p className="text-[10px] text-[#71717A] mt-1">{approvedWeeks.length} of {totalWeeks} weeks approved</p>
          </div>
        </div>

        <div className="p-2">
          {course.weeks?.map((week, wi) => {
            const unlocked = isWeekUnlocked(wi);
            const assignStatus = getWeekAssignmentStatus(wi);
            return (
              <div key={week.week_number} className="mb-1">
                <button data-testid={`course-week-${week.week_number}`}
                  onClick={() => unlocked && setActiveWeek(activeWeek === wi ? -1 : wi)}
                  disabled={!unlocked}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors ${
                    !unlocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'
                  }`}>
                  <div className="flex items-center gap-3">
                    {!unlocked ? (
                      <Lock className="w-4 h-4 text-[#71717A]" />
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        assignStatus === 'approved' ? 'bg-green-500 text-white' :
                        assignStatus === 'submitted' ? 'bg-yellow-500 text-black' :
                        week.assignment?.is_final_project ? 'bg-[#D4AF37] text-black' : 'bg-[#27272A] text-[#A1A1AA]'
                      }`}>
                        {week.assignment?.is_final_project ? 'Final' : `W${week.week_number}`}
                      </span>
                    )}
                    <div>
                      <span className="text-xs font-medium text-white">{week.title}</span>
                      {!unlocked && <p className="text-[8px] text-red-400">Complete previous week first</p>}
                      {assignStatus === 'submitted' && <p className="text-[8px] text-yellow-400">Awaiting approval</p>}
                      {assignStatus === 'approved' && <p className="text-[8px] text-green-400">Approved</p>}
                      {assignStatus === 'rejected' && <p className="text-[8px] text-red-400">Rejected - resubmit</p>}
                    </div>
                  </div>
                  {unlocked && (activeWeek === wi ? <ChevronUp className="w-4 h-4 text-[#D4AF37]" /> : <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />)}
                </button>

                {activeWeek === wi && unlocked && (
                  <div className="pl-4 pr-2 pb-2 space-y-0.5">
                    {week.lessons?.map((lesson) => {
                      const isCompleted = completedLessons.includes(lesson.lesson_id);
                      const isActive = activeLesson?.lesson_id === lesson.lesson_id;
                      return (
                        <button key={lesson.lesson_id} data-testid={`lesson-${lesson.lesson_id}`}
                          onClick={() => !isLocked && setActiveLesson(lesson)}
                          disabled={isLocked}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                            isActive ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : isLocked ? 'text-[#A1A1AA]/50 cursor-not-allowed' : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
                          }`}>
                          {isLocked ? <Lock className="w-3.5 h-3.5 shrink-0" /> : isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> : <Circle className="w-3.5 h-3.5 shrink-0" />}
                          <span className="flex-1 truncate">{lesson.title}</span>
                          <span className="text-[10px] text-[#A1A1AA] shrink-0">{lesson.duration}</span>
                        </button>
                      );
                    })}
                    {week.assignment && (
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                        assignStatus === 'approved' ? 'text-green-400 bg-green-500/10' :
                        assignStatus === 'submitted' ? 'text-yellow-400 bg-yellow-500/10' :
                        assignStatus === 'rejected' ? 'text-red-400 bg-red-500/10' :
                        week.assignment.is_final_project ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#A1A1AA]'
                      }`}>
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{week.assignment.title}</span>
                        {assignStatus === 'approved' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        {assignStatus === 'submitted' && <Clock className="w-3.5 h-3.5 shrink-0" />}
                        {assignStatus === 'rejected' && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:h-screen lg:overflow-y-auto">
        {isLocked ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center glass-panel rounded-2xl p-12 max-w-md">
              <Lock className="w-14 h-14 text-[#D4AF37] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Payment Required</h2>
              <p className="text-sm text-[#A1A1AA] mb-6">Your payment is being processed. Once confirmed, you'll have full access.</p>
              <Link to="/dashboard" className="btn-gold px-6 py-3 text-sm">Back to Dashboard</Link>
            </div>
          </div>
        ) : activeLesson ? (
          <div>
            {/* Video */}
            <div className="video-theater mb-6 rounded-2xl border border-[#27272A]">{getVideoEmbed(activeLesson)}</div>

            {/* Lesson Info */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{activeLesson.title}</h2>
                <p className="text-sm text-[#A1A1AA]">Duration: {activeLesson.duration}</p>
              </div>
              <button data-testid="mark-complete-btn"
                onClick={() => handleLessonComplete(activeLesson.lesson_id, !completedLessons.includes(activeLesson.lesson_id))}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors shrink-0 ${
                  completedLessons.includes(activeLesson.lesson_id)
                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                    : 'bg-[#111111] text-[#A1A1AA] border border-[#27272A] hover:border-green-500/50'
                }`}>
                <CheckCircle2 className="w-4 h-4" />
                {completedLessons.includes(activeLesson.lesson_id) ? 'Completed' : 'Mark Complete'}
              </button>
            </div>

            {/* Assignment */}
            {course.weeks?.[activeWeek]?.assignment && (() => {
              const assignment = course.weeks[activeWeek].assignment;
              const sub = submissions.find(s => s.assignment_id === assignment.assignment_id);
              const aStatus = sub?.status;
              return (
                <div className="bg-[#111111] border border-[#27272A] rounded-xl p-5 sm:p-6 mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-[#D4AF37]" />
                    <h3 className="text-sm font-bold text-white">
                      {assignment.is_final_project ? 'Final Project' : 'Assignment'}: {assignment.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#A1A1AA] mb-4">{assignment.description}</p>

                  {aStatus === 'approved' ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 px-4 py-3 rounded-lg">
                      <CheckCircle2 className="w-5 h-5" /> Assignment approved! Next week is unlocked.
                    </div>
                  ) : aStatus === 'submitted' ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-500/10 px-4 py-3 rounded-lg">
                        <Clock className="w-5 h-5" /> Assignment submitted. Waiting for admin approval.
                      </div>
                      {sub?.content && <p className="text-xs text-[#A1A1AA] bg-[#0A0A0A] p-3 rounded-lg">Your submission: {sub.content}</p>}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {aStatus === 'rejected' && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-lg mb-2">
                          <AlertCircle className="w-5 h-5" /> Rejected. {sub?.feedback || 'Please resubmit.'}
                        </div>
                      )}

                      {/* Submission Type Tabs */}
                      <div className="flex gap-2">
                        {[
                          { id: 'text', label: 'Text', icon: MessageSquare },
                          { id: 'link', label: 'Link', icon: Link2 },
                          { id: 'file', label: 'File', icon: Upload },
                        ].map(({ id, label, icon: Icon }) => (
                          <button key={id} data-testid={`sub-type-${id}`}
                            onClick={() => setSubType(id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                              subType === id ? 'bg-[#D4AF37] text-black' : 'bg-[#0A0A0A] text-[#A1A1AA] hover:bg-white/5'
                            }`}>
                            <Icon className="w-3.5 h-3.5" /> {label}
                          </button>
                        ))}
                      </div>

                      {subType === 'text' && (
                        <textarea data-testid="assignment-text-input" value={subText} onChange={(e) => setSubText(e.target.value)}
                          placeholder="Write your assignment answer here..." rows={4}
                          className="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white placeholder:text-[#71717A] focus:border-[#D4AF37] focus:outline-none resize-none" />
                      )}

                      {subType === 'link' && (
                        <input data-testid="assignment-link-input" value={subLink} onChange={(e) => setSubLink(e.target.value)}
                          placeholder="Paste your link (Google Docs, GitHub, Drive, etc.)"
                          className="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white placeholder:text-[#71717A] focus:border-[#D4AF37] focus:outline-none" />
                      )}

                      {subType === 'file' && (
                        <div>
                          {subFilePreview ? (
                            <div className="flex items-center gap-3 bg-[#0A0A0A] p-3 rounded-lg border border-[#27272A]">
                              <FileImage className="w-5 h-5 text-[#D4AF37] shrink-0" />
                              <span className="text-xs text-white flex-1 truncate">{subFilePreview}</span>
                              <button onClick={() => { setSubFile(null); setSubFilePreview(null); }} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <label data-testid="assignment-file-upload" className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-[#27272A] rounded-xl cursor-pointer hover:border-[#D4AF37]/40 transition-colors">
                              <Upload className="w-8 h-8 text-[#71717A] mb-2" />
                              <p className="text-xs text-white mb-0.5">Upload file (MS Word, Excel, PDF, etc.)</p>
                              <p className="text-[10px] text-[#71717A]">Max 10MB</p>
                              <input type="file" accept=".doc,.docx,.xls,.xlsx,.pdf,.ppt,.pptx,.txt,.zip,image/*" onChange={handleFileSelect} className="hidden" />
                            </label>
                          )}
                        </div>
                      )}

                      <button data-testid="submit-assignment-btn"
                        onClick={() => handleSubmitAssignment(assignment.assignment_id)}
                        disabled={submitting}
                        className="btn-gold px-6 py-2.5 text-sm disabled:opacity-50 flex items-center gap-2">
                        <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Assignment'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Play className="w-14 h-14 text-[#27272A] mx-auto mb-4" />
              <p className="text-[#A1A1AA]">Select a lesson to start learning</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
