import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ_DATA = [
  {
    category: 'General',
    questions: [
      { q: 'Who are these courses for?', a: 'Our courses are designed for complete beginners who want to learn digital skills and start earning online. No prior experience needed. Students from Pakistan, UAE, UK, and USA are welcome.' },
      { q: 'What makes OEC Tech Institute different?', a: 'We focus on practical, skills-based learning with weekly structured modules, real assignments, and final projects. Our courses are designed for real-world application, not just theory.' },
      { q: 'Do I get a certificate or diploma?', a: 'Yes! Upon completing individual courses, you receive a course completion certificate. By completing full diploma tracks (multiple courses), you earn a professional diploma.' },
    ]
  },
  {
    category: 'Courses & Content',
    questions: [
      { q: 'How are courses structured?', a: 'Each course is organized in weekly modules (typically 5-6 weeks). Each week includes video lessons, practical work, and an assignment. The final week includes a capstone project.' },
      { q: 'Do I get lifetime access?', a: 'Yes! Once you enroll and complete payment, you get lifetime access to all course materials, video lessons, assignments, and any future updates.' },
      { q: 'Can I learn at my own pace?', a: 'Absolutely. While courses are structured in weekly formats, you can go through the material at your own speed. There are no strict deadlines.' },
      { q: 'What courses do you offer?', a: 'We offer 7 courses: Computer Applications, Graphic Designing, Social Media Marketing, WordPress Web Development, Shopify Dropshipping, Amazon Virtual Assistant, and eBay Business.' },
    ]
  },
  {
    category: 'Payment & Enrollment',
    questions: [
      { q: 'What payment methods do you accept?', a: 'We accept JazzCash, EasyPaisa, and Bank Transfer. All Pakistan-friendly payment options. Once payment is confirmed, your course access is activated within 24 hours.' },
      { q: 'How much do courses cost?', a: 'Course prices range from PKR 5,000 to PKR 15,000 depending on the course. Check individual course pages for exact pricing.' },
      { q: 'Is there a refund policy?', a: 'We offer a 7-day satisfaction guarantee. If you are not satisfied with the course content within the first 7 days, contact us for a full refund.' },
      { q: 'How do I enroll in a course?', a: 'Simply create an account, choose your course, select a payment method, and complete the payment. Your dashboard will be unlocked once payment is confirmed.' },
    ]
  },
  {
    category: 'Technical & Support',
    questions: [
      { q: 'What do I need to get started?', a: 'A laptop or desktop computer with internet access. Some courses may require specific tools (we provide guidance). No prior technical experience needed.' },
      { q: 'How do I access my courses after payment?', a: 'After payment confirmation, log into your student dashboard. All your enrolled courses will appear in "My Courses" with full access to video lessons and assignments.' },
      { q: 'How can I contact support?', a: 'You can reach us via WhatsApp (fastest), email at info@oectech.institute, or through our contact form. We typically respond within a few hours.' },
    ]
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState({});

  const toggle = (key) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div data-testid="faq-page" className="page-transition min-h-screen bg-[#050505]">
      <section className="pt-12 pb-8 border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Help Center</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-base text-[#A1A1AA] max-w-xl">
            Everything you need to know about our courses, payments, and platform.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-12">
          {FAQ_DATA.map((section) => (
            <div key={section.category}>
              <h2 className="text-xl font-bold text-[#D4AF37] mb-6">{section.category}</h2>
              <div className="space-y-3">
                {section.questions.map((faq, i) => {
                  const key = `${section.category}-${i}`;
                  return (
                    <div key={key} className="bg-[#111111] border border-[#27272A] rounded-xl overflow-hidden">
                      <button
                        data-testid={`faq-${key}`}
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/5 transition-colors"
                      >
                        <span className="text-sm font-semibold text-white pr-4">{faq.q}</span>
                        {openItems[key] ? <ChevronUp className="w-5 h-5 text-[#D4AF37] shrink-0" /> : <ChevronDown className="w-5 h-5 text-[#A1A1AA] shrink-0" />}
                      </button>
                      {openItems[key] && (
                        <div className="px-6 pb-5">
                          <p className="text-sm text-[#A1A1AA] leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
