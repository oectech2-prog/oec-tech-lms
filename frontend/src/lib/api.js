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
export const updateProfile = (data) => api.put('/profile', data);

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

// Admin Auth
export const adminLogin = (password) => api.post('/admin/login', { password });

// Student uploads
export const studentUpload = (file) => {
  const fd = new FormData();
  fd.append('file', file);
  return api.post('/student/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// Admission form
export const submitAdmissionForm = (data) => api.post('/admission-form', data);
export const getAdmissionForms = () => api.get('/admin/admission-forms');

// Installments
export const submitInstallment2 = (enrollmentId, data) => api.post(`/enrollments/${enrollmentId}/submit-installment-2`, data);
export const adminApproveInstallment2 = (enrollmentId, data) => api.put(`/admin/enrollments/${enrollmentId}/installment-2`, data);
export const getNotifications = () => api.get('/notifications');

// Diploma Enrollments
export const createDiplomaEnrollment = (data) => api.post('/diploma-enrollments', data);
export const getAdminDiplomaEnrollments = () => api.get('/admin/diploma-enrollments');
export const updateDiplomaEnrollmentStatus = (id, data) => api.put(`/admin/diploma-enrollments/${id}`, data);
export const adminApproveDiplomaInstallment2 = (id, data) => api.put(`/admin/diploma-enrollments/${id}/installment-2`, data);
export const submitDiplomaInstallment2 = (enrollmentId, data) => api.post(`/diploma-enrollments/${enrollmentId}/submit-installment-2`, data);

export default api;
