const express = require('express');
const courseController = require('../controllers/courseController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Only a logged-in admin (employer) may create, edit or delete
const adminOnly = [authenticate, requireRole('employer')];

router.get('/meta/categories', courseController.getCategories);
router.post('/meta/categories', ...adminOnly, courseController.createCategory);
router.delete('/meta/categories/:categoryId', ...adminOnly, courseController.deleteCategory);

// Lesson documents: admins upload, any logged-in user can open
router.post('/uploads', ...adminOnly, courseController.uploadLessonFile);
router.get('/files/url', authenticate, courseController.getLessonFileUrl);

router.get('/employee/:userId', courseController.getEmployeeCourses);

router.route('/')
  .get(courseController.getAllCourses)
  .post(...adminOnly, courseController.createCourse);

router.route('/:id')
  .get(courseController.getCourseById)
  .patch(...adminOnly, courseController.updateCourse)
  .delete(...adminOnly, courseController.deleteCourse);

module.exports = router;