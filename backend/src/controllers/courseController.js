const Course = require('../models/courseModel');

// @desc Create a new nested course
// @route POST /api/courses
exports.createCourse = async (req, res) => {
    try {
        const { title, description, category, difficulty, certifiable, modules } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }
        const newCourse = await Course.createFullCourse(
            { title, description, category, difficulty, certifiable },
            modules || []
        );
        res.status(201).json({ message: 'Course published to database', course: newCourse });
    } catch (error) {
        res.status(500).json({ message: 'Failed to publish course', error: error.message });
    }
};

// @desc Get all courses summary list
// @route GET /api/courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findAll();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching courses', error: error.message });
    }
};

// @desc Get a single course with nested modules and lessons
// @route GET /api/courses/:id
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching course', error: error.message });
    }
};

// @desc Update a course's core details
// @route PATCH /api/courses/:id
exports.updateCourse = async (req, res) => {
    try {
        const updatedCourse = await Course.update(req.params.id, req.body);
        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found or update failed' });
        }
        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating course', error: error.message });
    }
};

// @desc Delete a course completely (cascades to modules and lessons)
// @route DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
    try {
        const deletedCourse = await Course.delete(req.params.id);
        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found'});
        }
        res.json({ message: 'Course successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting course', error: error.message});
    }
};