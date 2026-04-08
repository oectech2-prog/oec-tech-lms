import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMyCourses } from '../lib/api';
import { jsPDF } from 'jspdf';
import { ArrowLeft, Download, Award, Calendar, Hash, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Certificate() {
  const { enrollmentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    getMyCourses().then(r => {
      const found = r.data.find(e => e.enrollment.enrollment_id === enrollmentId);
      setData(found);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [enrollmentId]);

  const generatePDF = () => {
    if (!data) return;
    const { enrollment, course } = data;
    const certId = `OEC-${enrollment.enrollment_id.slice(-8).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
    const studentName = enrollment.user_name || 'Student';
    const completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const w = 297, h = 210;

    // Background
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, w, h, 'F');

    // Gold border
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(2);
    doc.rect(10, 10, w - 20, h - 20);
    doc.setLineWidth(0.5);
    doc.rect(14, 14, w - 28, h - 28);

    // Corner decorations
    const cornerSize = 20;
    [[14, 14], [w - 14, 14], [14, h - 14], [w - 14, h - 14]].forEach(([cx, cy]) => {
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(1);
      const dx = cx < w / 2 ? 1 : -1;
      const dy = cy < h / 2 ? 1 : -1;
      doc.line(cx, cy, cx + cornerSize * dx, cy);
      doc.line(cx, cy, cx, cy + cornerSize * dy);
    });

    // Header
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(14);
    doc.text('OEC TECH INSTITUTE', w / 2, 35, { align: 'center' });

    // Certificate Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.text('CERTIFICATE', w / 2, 55, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(161, 161, 170);
    doc.text('OF COMPLETION', w / 2, 64, { align: 'center' });

    // Divider line
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(w / 2 - 40, 70, w / 2 + 40, 70);

    // Presented to
    doc.setFontSize(11);
    doc.setTextColor(161, 161, 170);
    doc.text('This certificate is proudly presented to', w / 2, 82, { align: 'center' });

    // Student name
    doc.setFontSize(28);
    doc.setTextColor(212, 175, 55);
    doc.text(studentName, w / 2, 98, { align: 'center' });

    // Underline
    const nameWidth = doc.getTextWidth(studentName);
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.line(w / 2 - nameWidth / 2, 101, w / 2 + nameWidth / 2, 101);

    // Course info
    doc.setFontSize(11);
    doc.setTextColor(161, 161, 170);
    doc.text('for successfully completing the course', w / 2, 114, { align: 'center' });

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(course.title, w / 2, 126, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(161, 161, 170);
    doc.text(`${course.duration} | ${course.level} | ${course.weeks?.length || 0} Weeks`, w / 2, 135, { align: 'center' });

    // Bottom section
    doc.setFontSize(9);
    doc.setTextColor(161, 161, 170);

    // Date
    doc.text('Date of Completion', 50, 165, { align: 'center' });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(completionDate, 50, 172, { align: 'center' });

    // Certificate ID
    doc.setFontSize(9);
    doc.setTextColor(161, 161, 170);
    doc.text('Certificate ID', w / 2, 165, { align: 'center' });
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(11);
    doc.text(certId, w / 2, 172, { align: 'center' });

    // Issued by
    doc.setFontSize(9);
    doc.setTextColor(161, 161, 170);
    doc.text('Issued By', w - 50, 165, { align: 'center' });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text('OEC Tech Institute', w - 50, 172, { align: 'center' });

    // Divider lines
    doc.setDrawColor(39, 39, 42);
    doc.setLineWidth(0.3);
    doc.line(20, 155, w - 20, 155);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 110);
    doc.text('This certificate verifies that the above-named student has successfully completed all course requirements including weekly modules, assignments, and the final project.', w / 2, h - 18, { align: 'center' });

    doc.save(`OEC_Certificate_${course.title.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data || data.enrollment.progress < 100) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="text-center glass-panel rounded-2xl p-10 max-w-md">
        <Award className="w-16 h-16 text-[#27272A] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-3">Certificate Not Available</h2>
        <p className="text-sm text-[#A1A1AA] mb-6">Complete all lessons in your course to earn your certificate.</p>
        <Link to="/dashboard" className="btn-gold px-6 py-3 text-sm">Back to Dashboard</Link>
      </div>
    </div>
  );

  const { enrollment, course } = data;
  const certId = `OEC-${enrollment.enrollment_id.slice(-8).toUpperCase()}`;

  return (
    <div data-testid="certificate-page" className="min-h-screen bg-[#050505] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Certificate Preview */}
          <div className="bg-[#111111] border-2 border-[#D4AF37] rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-[#D4AF37]" />
            <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-[#D4AF37]" />

            <p className="text-sm uppercase tracking-[0.3em] text-[#D4AF37] mb-2">OEC Tech Institute</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">CERTIFICATE</h1>
            <p className="text-sm text-[#A1A1AA] mb-8">OF COMPLETION</p>

            <div className="w-20 h-[1px] bg-[#D4AF37] mx-auto mb-8" />

            <p className="text-sm text-[#A1A1AA] mb-2">This certificate is proudly presented to</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gold-gradient mb-2">{enrollment.user_name || 'Student'}</h2>
            <div className="w-48 h-[1px] bg-[#D4AF37]/50 mx-auto mb-8" />

            <p className="text-sm text-[#A1A1AA] mb-2">for successfully completing the course</p>
            <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
            <p className="text-xs text-[#A1A1AA] mb-10">{course.duration} | {course.level} | {course.weeks?.length || 0} Weeks</p>

            <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-[#27272A]">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-[#A1A1AA]">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Hash className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-[#A1A1AA]">{certId}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-[#A1A1AA]">OEC Tech Institute</span>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center mt-8">
            <button
              data-testid="download-certificate-btn"
              onClick={generatePDF}
              className="btn-gold px-6 py-2.5 text-sm"
            >
              Download Certificate (PDF)
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
