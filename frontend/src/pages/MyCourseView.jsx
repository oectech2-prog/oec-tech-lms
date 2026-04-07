import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMyCourses, updateProgress, submitAssignment, getSubmissions } from '../lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Play, CheckCircle2, Circle, FileText, Lock, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { Textarea } from '../components/ui/textarea';

export default function MyCourseView() {
  const { enrollmentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(0);
  const [activeLesson, setActiveLesson] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [assignmentText, setAssignmentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await getMyCourses();
      const found = res.data.find(e => e.enrollment.enrollment_id === enrollmentId);
      if (found) {
        setData(found);
        if (found.course.weeks?.length > 0 && found.course.weeks[0].lessons?.length > 0) {
          setActiveLesson(found.course.weeks[0].lessons[0]);
        }
      }
      const subRes = await getSubmissions(enrollmentId);
      setSubmissions(subRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [enrollmentId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLessonComplete = async (lessonId, completed) => {
    try {
      const res = await updateProgress(enrollmentId, { lesson_id: lessonId, completed });
      setData(prev => ({
        ...prev,
        enrollment: {
          ...prev.enrollment,
          progress: res.data.progress,
          completed_lessons: res.data.completed_lessons
        }
      }));
      toast.success(completed ? 'Lesson completed!' : 'Lesson unmarked');
    } catch {
      toast.error('Failed to update progress');
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    if (!assignmentText.trim()) { toast.error('Please write your answer'); return; }
    setSubmitting(true);
    try {
      await submitAssignment(enrollmentId, { assignment_id: assignmentId, content: assignmentText });
      toast.success('Assignment submitted!');
      setAssignmentText('');
      const subRes = await getSubmissions(enrollmentId);
      setSubmissions(subRes.data);
      setData(prev => ({
        ...prev,
        enrollment: {
          ...prev.enrollment,
          submitted_assignments: [...(prev.enrollment.submitted_assignments || []), assignmentId]
        }
      }));
    } catch {
      toast.error('Failed to submit assignment');
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-4">Course Not Found</h2>
        <Link to="/dashboard" className="btn-gold px-6 py-3 text-sm">Back to Dashboard</Link>
      </div>
    </div>
  );

  const { enrollment, course } = data;
  const isLocked = enrollment.payment_status !== 'completed';
  const completedLessons = enrollment.completed_lessons || [];
  const submittedAssignments = enrollment.submitted_assignments || [];

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
      {/* Sidebar - Course Outline */}
      <aside className="w-full lg:w-80 xl:w-96 bg-[#0A0A0A] border-b lg:border-b-0 lg:border-r border-[#27272A] lg:h-screen lg:overflow-y-auto">
        <div className="p-4 border-b border-[#27272A]">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h2 className="text-base font-bold text-white">{course.title}</h2>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-[#A1A1AA] mb-1">
              <span>Progress</span>
              <span>{enrollment.progress}%</span>
            </div>
            <Progress value={enrollment.progress} className="h-2 bg-[#27272A]" />
          </div>
        </div>

        <div className="p-2">
          {course.weeks?.map((week, wi) => (
            <div key={week.week_number} className="mb-1">
              <button
                data-testid={`course-week-${week.week_number}`}
                onClick={() => setActiveWeek(activeWeek === wi ? -1 : wi)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    week.assignment?.is_final_project ? 'bg-[#D4AF37] text-black' : 'bg-[#27272A] text-[#A1A1AA]'
                  }`}>
                    {week.assignment?.is_final_project ? 'Final' : `W${week.week_number}`}
                  </span>
                  <span className="text-xs font-medium text-white">{week.title}</span>
                </div>
                {activeWeek === wi ? <ChevronUp className="w-4 h-4 text-[#D4AF37]" /> : <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />}
              </button>

              {activeWeek === wi && (
                <div className="pl-4 pr-2 pb-2 space-y-0.5">
                  {week.lessons?.map((lesson) => {
                    const isCompleted = completedLessons.includes(lesson.lesson_id);
                    const isActive = activeLesson?.lesson_id === lesson.lesson_id;
                    return (
                      <button
                        key={lesson.lesson_id}
                        data-testid={`lesson-${lesson.lesson_id}`}
                        onClick={() => !isLocked && setActiveLesson(lesson)}
                        disabled={isLocked}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                          isActive ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : isLocked ? 'text-[#A1A1AA]/50 cursor-not-allowed' : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {isLocked ? <Lock className="w-3.5 h-3.5 shrink-0" /> : isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> : <Circle className="w-3.5 h-3.5 shrink-0" />}
                        <span className="flex-1 truncate">{lesson.title}</span>
                        <span className="text-[10px] text-[#A1A1AA] shrink-0">{lesson.duration}</span>
                      </button>
                    );
                  })}
                  {week.assignment && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                      submittedAssignments.includes(week.assignment.assignment_id)
                        ? 'text-green-400 bg-green-500/10'
                        : week.assignment.is_final_project ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#A1A1AA]'
                    }`}>
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{week.assignment.title}</span>
                      {submittedAssignments.includes(week.assignment.assignment_id) && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:h-screen lg:overflow-y-auto">
        {isLocked ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center glass-panel rounded-2xl p-12 max-w-md">
              <Lock className="w-14 h-14 text-[#D4AF37] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Payment Required</h2>
              <p className="text-sm text-[#A1A1AA] mb-6">Your payment is being processed. Once confirmed, you will have full access to all course materials.</p>
              <Link to="/dashboard" className="btn-gold px-6 py-3 text-sm">Back to Dashboard</Link>
            </div>
          </div>
        ) : activeLesson ? (
          <div>
            {/* Video Player */}
            <div className="video-theater mb-6 rounded-2xl border border-[#27272A]">
              {getVideoEmbed(activeLesson)}
            </div>

            {/* Lesson Info */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{activeLesson.title}</h2>
                <p className="text-sm text-[#A1A1AA]">Duration: {activeLesson.duration}</p>
              </div>
              <button
                data-testid="mark-complete-btn"
                onClick={() => handleLessonComplete(activeLesson.lesson_id, !completedLessons.includes(activeLesson.lesson_id))}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  completedLessons.includes(activeLesson.lesson_id)
                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                    : 'bg-[#111111] text-[#A1A1AA] border border-[#27272A] hover:border-green-500/50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {completedLessons.includes(activeLesson.lesson_id) ? 'Completed' : 'Mark Complete'}
              </button>
            </div>

            {/* Current Week Assignment */}
            {course.weeks?.[activeWeek]?.assignment && (
              <div className="bg-[#111111] border border-[#27272A] rounded-xl p-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-base font-bold text-white">
                    {course.weeks[activeWeek].assignment.is_final_project ? 'Final Project' : 'Assignment'}:
                    {' '}{course.weeks[activeWeek].assignment.title}
                  </h3>
                </div>
                <p className="text-sm text-[#A1A1AA] mb-4">{course.weeks[activeWeek].assignment.description}</p>

                {submittedAssignments.includes(course.weeks[activeWeek].assignment.assignment_id) ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 px-4 py-3 rounded-lg">
                    <CheckCircle2 className="w-5 h-5" />
                    Assignment submitted successfully!
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      data-testid="assignment-input"
                      value={assignmentText}
                      onChange={(e) => setAssignmentText(e.target.value)}
                      placeholder="Write your assignment answer here or paste a link..."
                      rows={4}
                      className="bg-[#050505] border-[#27272A] text-white focus:border-[#D4AF37] resize-none"
                    />
                    <button
                      data-testid="submit-assignment-btn"
                      onClick={() => handleSubmitAssignment(course.weeks[activeWeek].assignment.assignment_id)}
                      disabled={submitting}
                      className="btn-gold px-6 py-2 text-sm inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Assignment'} <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Play className="w-14 h-14 text-[#27272A] mx-auto mb-4" />
              <p className="text-[#A1A1AA]">Select a lesson from the sidebar to start learning</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
