import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Auth
export const exchangeSession = (sessionId) => api.post('/auth/session', { session_id: sessionId });
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');

// Courses
export const getCourses = () => api.get('/courses');
export const getCourse = (id) => api.get(`/courses/${id}`);

// Enrollments
export const enrollInCourse = (data) => api.post('/enrollments', data);
export const getMyCourses = () => api.get('/enrollments/my-courses');
export const updateProgress = (enrollmentId, data) => api.put(`/enrollments/${enrollmentId}/progress`, data);
export const submitAssignment = (enrollmentId, data) => api.post(`/enrollments/${enrollmentId}/submit-assignment`, data);
export const getSubmissions = (enrollmentId) => api.get(`/enrollments/${enrollmentId}/submissions`);

// Diploma Tracks
export const getDiplomaTracks = () => api.get('/diploma-tracks');
export const getDiplomaTrack = (id) => api.get(`/diploma-tracks/${id}`);

// Reviews
export const getReviews = () => api.get('/reviews');
export const createReview = (data) => api.post('/reviews', data);

// Contact
export const sendContact = (data) => api.post('/contact', data);

// Admin
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminStudents = () => api.get('/admin/students');
export const getAdminEnrollments = () => api.get('/admin/enrollments');
export const updateEnrollmentStatus = (id, data) => api.put(`/admin/enrollments/${id}`, data);
export const getAdminCourses = () => api.get('/admin/courses');
export const createCourse = (data) => api.post('/admin/courses', data);
export const updateCourse = (id, data) => api.put(`/admin/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/admin/courses/${id}`);
export const getAdminMessages = () => api.get('/admin/messages');
export const removeStudent = (userId) => api.delete(`/admin/students/${userId}`);
export const getStudentProgress = (userId) => api.get(`/admin/students/${userId}/progress`);

// Admin OTP Auth
export const requestAdminOTP = (phone) => api.post('/admin/request-otp', { phone });
export const verifyAdminOTP = (phone, otp) => api.post('/admin/verify-otp', { phone, otp });

export default api;
