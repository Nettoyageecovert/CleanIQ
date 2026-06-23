const express = require('express');
const courseController = require('../controllers/courseController');

const router = express.Router();

// Route for dealing with the entire collection
router.route('/')
    .get(courseController.getAllCourses)
    .post(courseController.createCourse);

// Route for dealing with individual items via ID
router.route('/:id')
    .get(courseController.getCourseById)
    .patch(courseController.updateCourse)
    .delete(courseController.deleteCourse);

module.exports = router;