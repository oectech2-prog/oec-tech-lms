// OEC Tech Institute - API Client (Vanilla JS, Fetch-based)
const API = '/api';

const Api = {
  async _fetch(method, path, body = null, isFormData = false) {
    const opts = { method, credentials: 'include', headers: {} };
    if (body && !isFormData) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    if (body && isFormData) { opts.body = body; }
    const res = await fetch(`${API}${path}`, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw { status: res.status, detail: err.detail || 'Request failed' };
    }
    return res.json();
  },
  get: (p) => Api._fetch('GET', p),
  post: (p, b) => Api._fetch('POST', p, b),
  put: (p, b) => Api._fetch('PUT', p, b),
  del: (p) => Api._fetch('DELETE', p),
  upload: async (file) => {
    const fd = new FormData(); fd.append('file', file);
    return Api._fetch('POST', '/student/upload', fd, true);
  },

  // Auth
  exchangeSession: (sid) => Api.post('/auth/session', { session_id: sid }),
  getMe: () => Api.get('/auth/me'),
  logout: () => Api.post('/auth/logout'),
  updateProfile: (d) => Api.put('/profile', d),
  adminLogin: (pw) => Api.post('/admin/login', { password: pw }),

  // Courses
  getCourses: () => Api.get('/courses'),
  getCourse: (id) => Api.get(`/courses/${id}`),

  // Enrollments
  enroll: (d) => Api.post('/enrollments', d),
  getMyCourses: () => Api.get('/enrollments/my-courses'),
  updateProgress: (eid, d) => Api.put(`/enrollments/${eid}/progress`, d),
  submitAssignment: (eid, d) => Api.post(`/enrollments/${eid}/submit-assignment`, d),
  getSubmissions: (eid) => Api.get(`/enrollments/${eid}/submissions`),
  submitInstallment2: (eid, d) => Api.post(`/enrollments/${eid}/submit-installment-2`, d),

  // Diploma
  getDiplomaTracks: () => Api.get('/diploma-tracks'),
  getDiplomaTrack: (id) => Api.get(`/diploma-tracks/${id}`),
  createDiplomaEnrollment: (d) => Api.post('/diploma-enrollments', d),
  submitDiplomaInstallment2: (eid, d) => Api.post(`/diploma-enrollments/${eid}/submit-installment-2`, d),

  // Reviews, Contact
  getReviews: () => Api.get('/reviews'),
  createReview: (d) => Api.post('/reviews', d),
  sendContact: (d) => Api.post('/contact', d),

  // Notifications
  getNotifications: () => Api.get('/notifications'),

  // Admission
  submitAdmission: (d) => Api.post('/admission-form', d),

  // Video Testimonials
  getVideoTestimonials: () => Api.get('/video-testimonials'),
  submitVideoTestimonial: (d) => Api.post('/video-testimonials', d),

  // Admin
  getAdminStats: () => Api.get('/admin/stats'),
  getAdminStudents: () => Api.get('/admin/students'),
  getStudentProgress: (uid) => Api.get(`/admin/students/${uid}/progress`),
  removeStudent: (uid) => Api.del(`/admin/students/${uid}`),
  getAdminEnrollments: () => Api.get('/admin/enrollments'),
  updateEnrollmentStatus: (id, d) => Api.put(`/admin/enrollments/${id}`, d),
  adminApproveInst2: (id, d) => Api.put(`/admin/enrollments/${id}/installment-2`, d),
  getAdminCourses: () => Api.get('/admin/courses'),
  createCourse: (d) => Api.post('/admin/courses', d),
  updateCourse: (id, d) => Api.put(`/admin/courses/${id}`, d),
  deleteCourse: (id) => Api.del(`/admin/courses/${id}`),
  updateCourseOutline: (id, d) => Api.put(`/admin/courses/${id}/outline`, d),
  getAdminMessages: () => Api.get('/admin/messages'),
  getAdminAssignments: () => Api.get('/admin/assignments'),
  reviewAssignment: (id, d) => Api.put(`/admin/assignments/${id}`, d),
  getAdminAdmissions: () => Api.get('/admin/admission-forms'),
  getAdminDiplomaEnrollments: () => Api.get('/admin/diploma-enrollments'),
  updateDiplomaStatus: (id, d) => Api.put(`/admin/diploma-enrollments/${id}`, d),
  adminApproveDiplomaInst2: (id, d) => Api.put(`/admin/diploma-enrollments/${id}/installment-2`, d),
  deleteDiplomaEnrollment: (id) => Api.del(`/admin/diploma-enrollments/${id}`),
  patchCourse: (id, d) => Api.put(`/admin/courses/${id}`, d),
  getDefaulters: () => Api.get('/admin/defaulters'),
  deactivateStudent: (id) => Api.put(`/admin/defaulters/${id}/deactivate`),
  activateStudent: (id) => Api.put(`/admin/defaulters/${id}/activate`),
  getAdminVideoTestimonials: () => Api.get('/admin/video-testimonials'),
  addAdminVideoTestimonial: (d) => Api.post('/admin/video-testimonials', d),
  updateAdminVideoTestimonial: (id, d) => Api.put(`/admin/video-testimonials/${id}`, d),
  deleteAdminVideoTestimonial: (id) => Api.del(`/admin/video-testimonials/${id}`),
  getExpenses: () => Api.get('/admin/expenses'),
  addExpense: (d) => Api.post('/admin/expenses', d),
  updateExpense: (id, d) => Api.put(`/admin/expenses/${id}`, d),
  deleteExpense: (id) => Api.del(`/admin/expenses/${id}`),
  getExpenseStats: () => Api.get('/admin/expenses/stats'),
};
