const Course = require('../models/courseModel');

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findAll();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching courses', error: error.message });
    }
};

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

exports.createCourse = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }
        const newCourse = await Course.create({ title, description});
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ message: 'Server error creating course', error: error.message });
    }
};

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