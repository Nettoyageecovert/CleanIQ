const Course = require('../models/courseModel');
const { getQuizStore } = require('../storage');
const { computeCourseProgress } = require('../utils/employeeDashboard');
const { TRAINING_CATEGORIES } = require('../constants/trainingCategories');

// @desc Create a new nested course
// @route POST /api/courses
exports.createCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            difficulty,
            certifiable,
            required,
            duration,
            color,
            icon,
            thumbnailUrl,
            modules,
        } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }
        const newCourse = await Course.createFullCourse(
            {
                title,
                description,
                category,
                difficulty,
                certifiable,
                required,
                duration,
                color,
                icon,
                thumbnailUrl,
            },
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

exports.getCategories = async (req, res) => {
    try {
        const courses = await Course.findAll();
        const fromCourses = courses.map(course => course.category).filter(Boolean);
        const categories = Array.from(new Set([...TRAINING_CATEGORIES, ...fromCourses]));
        res.json({ categories });
    } catch (error) {
        res.status(500).json({ message: 'Unable to load categories.', error: error.message });
    }
};

exports.getEmployeeCourses = async (req, res) => {
    try {
        const courses = await Course.findByEmployeeId(req.params.userId);
        const normalized = courses.map(course => ({
            ...course,
            progressStatus: course.status,
        }));
        return res.json({ courses: normalized });
    } catch (error) {
        try {
            const quizStore = getQuizStore();
            const allCourses = await Course.findAll();
            const published = allCourses.filter(course => course.duration !== 'draft');
            const [quizzes, attempts] = await Promise.all([
                quizStore.findAll(),
                quizStore.findAttemptsByUser(req.params.userId),
            ]);

            const enriched = published.map(course => {
                const { progress, status } = computeCourseProgress(course, quizzes, attempts);
                return {
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    category: course.category,
                    difficulty: course.difficulty,
                    certifiable: course.certifiable,
                    required: course.required,
                    color: course.color,
                    icon: course.icon,
                    thumbnailUrl: course.thumbnail_url,
                    progress,
                    progressStatus: status,
                };
            });

            res.json({ courses: enriched });
        } catch (fallbackError) {
            res.status(500).json({ message: 'Unable to load employee courses.', error: fallbackError.message });
        }
    }
};