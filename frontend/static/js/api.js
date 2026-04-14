const API = '/api';

async function request(method, path, body, isFormData = false) {
  const opts = { method, credentials: 'same-origin', headers: {} };
  if (body && !isFormData) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  } else if (body && isFormData) {
    opts.body = body;
  }
  const res = await fetch(`${API}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Auth
  createSession: (d) => request('POST', '/auth/session', d),
  getMe: () => request('GET', '/auth/me'),
  logout: () => request('POST', '/auth/logout'),
  updateProfile: (d) => request('PUT', '/profile', d),

  // Courses
  getCourses: () => request('GET', '/courses'),
  getCourse: (id) => request('GET', `/courses/${id}`),
  getDiplomaTracks: () => request('GET', '/diploma-tracks'),
  getDiplomaTrack: (id) => request('GET', `/diploma-tracks/${id}`),

  // Enrollments
  enroll: (d) => request('POST', '/enrollments', d),
  getMyCourses: () => request('GET', '/enrollments/my-courses'),
  updateProgress: (eid, d) => request('PUT', `/enrollments/${eid}/progress`, d),
  submitAssignment: (eid, d) => request('POST', `/enrollments/${eid}/submit-assignment`, d),
  getSubmissions: (eid) => request('GET', `/enrollments/${eid}/submissions`),
  submitInstallment2: (eid, d) => request('POST', `/enrollments/${eid}/submit-installment-2`, d),

  // Diplomas
  enrollDiploma: (d) => request('POST', '/diploma-enrollments', d),
  submitDiplomaInstallment2: (eid, d) => request('POST', `/diploma-enrollments/${eid}/submit-installment-2`, d),

  // General
  getReviews: () => request('GET', '/reviews'),
  postReview: (d) => request('POST', '/reviews', d),
  postContact: (d) => request('POST', '/contact', d),
  getCertificate: (eid) => request('GET', `/certificates/${eid}`),
  getNotifications: () => request('GET', '/notifications'),
  submitAdmissionForm: (d) => request('POST', '/admission-form', d),

  // Files
  uploadFile: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return request('POST', '/student/upload', fd, true);
  },
  adminUpload: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return request('POST', '/upload', fd, true);
  },

  // Admin
  adminLogin: (d) => request('POST', '/admin/login', d),
  getAdminStats: () => request('GET', '/admin/stats'),
  getAdminStudents: () => request('GET', '/admin/students'),
  getStudentProgress: (uid) => request('GET', `/admin/students/${uid}/progress`),
  removeStudent: (uid) => request('DELETE', `/admin/students/${uid}`),
  getAdminEnrollments: () => request('GET', '/admin/enrollments'),
  updateEnrollment: (eid, d) => request('PUT', `/admin/enrollments/${eid}`, d),
  approveInstallment2: (eid, d) => request('PUT', `/admin/enrollments/${eid}/installment-2`, d),
  getAdminCourses: () => request('GET', '/admin/courses'),
  createCourse: (d) => request('POST', '/admin/courses', d),
  updateCourse: (id, d) => request('PUT', `/admin/courses/${id}`, d),
  deleteCourse: (id) => request('DELETE', `/admin/courses/${id}`),
  getAdminAssignments: () => request('GET', '/admin/assignments'),
  reviewAssignment: (sid, d) => request('PUT', `/admin/assignments/${sid}`, d),
  getAdminMessages: () => request('GET', '/admin/messages'),
  getDefaulters: () => request('GET', '/admin/defaulters'),
  deactivateStudent: (eid) => request('PUT', `/admin/defaulters/${eid}/deactivate`),
  activateStudent: (eid) => request('PUT', `/admin/defaulters/${eid}/activate`),
  getAdminDiplomaEnrollments: () => request('GET', '/admin/diploma-enrollments'),
  updateDiplomaEnrollment: (eid, d) => request('PUT', `/admin/diploma-enrollments/${eid}`, d),
  approveDiplomaInstallment2: (eid, d) => request('PUT', `/admin/diploma-enrollments/${eid}/installment-2`, d),
  getAdmissionForms: () => request('GET', '/admin/admission-forms'),
};
