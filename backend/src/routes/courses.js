const express = require('express');
const courseController = require('../controllers/courseController');

const router = express.Router();

router.get('/meta/categories', courseController.getCategories);
router.get('/employee/:userId', courseController.getEmployeeCourses);

router.route('/')
  .get(courseController.getAllCourses)
  .post(courseController.createCourse);

router.route('/:id')
  .get(courseController.getCourseById)
  .patch(courseController.updateCourse)
  .delete(courseController.deleteCourse);

module.exports = router;
