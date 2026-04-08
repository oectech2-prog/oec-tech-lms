import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { Toaster } from "./components/ui/sonner";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthCallback from "./components/AuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import Preloader from "./components/Preloader";
import ScrollToTop from "./components/ScrollToTop";
import WhatsAppChat from "./components/WhatsAppChat";

// Pages
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import DiplomaTracks from "./pages/DiplomaTracks";
import Reviews from "./pages/Reviews";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyCourseView from "./pages/MyCourseView";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Certificate from "./pages/Certificate";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminAdmissions from "./pages/admin/AdminAdmissions";
import AdminDiplomaStudents from "./pages/admin/AdminDiplomaStudents";
import AdminDefaulters from "./pages/admin/AdminDefaulters";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import TrackCheckout from "./pages/TrackCheckout";

function AppRouter() {
  const location = useLocation();

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  // Check URL fragment for session_id synchronously during render
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  // Hide header/footer on dashboard/admin routes
  const isDashboard = location.pathname.startsWith('/dashboard') ||
                      location.pathname.startsWith('/admin') ||
                      location.pathname.startsWith('/my-course') ||
                      location.pathname.startsWith('/profile') ||
                      location.pathname.startsWith('/checkout') ||
                      location.pathname.startsWith('/certificate');

  return (
    <>
      {!isDashboard && <Header />}
      <main className={!isDashboard ? 'pt-16' : ''}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/diploma-tracks" element={<DiplomaTracks />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />

          {/* Student */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/my-course/:enrollmentId" element={<ProtectedRoute><MyCourseView /></ProtectedRoute>} />
          <Route path="/checkout/:courseId" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/checkout/track/:trackId" element={<ProtectedRoute><TrackCheckout /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/certificate/:enrollmentId" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute requireAdmin><AdminCourses /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute requireAdmin><AdminStudents /></ProtectedRoute>} />
          <Route path="/admin/enrollments" element={<ProtectedRoute requireAdmin><AdminEnrollments /></ProtectedRoute>} />
          <Route path="/admin/admissions" element={<ProtectedRoute requireAdmin><AdminAdmissions /></ProtectedRoute>} />
          <Route path="/admin/diploma-students" element={<ProtectedRoute requireAdmin><AdminDiplomaStudents /></ProtectedRoute>} />
          <Route path="/admin/defaulters" element={<ProtectedRoute requireAdmin><AdminDefaulters /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
      <ScrollToTop />
      <WhatsAppChat />
      <Toaster position="top-right" richColors />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Preloader />
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
