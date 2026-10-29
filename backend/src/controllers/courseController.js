const Course = require('../models/courseModel');
const Category = require('../models/categoryModel');
const { getQuizStore } = require('../storage');
const { computeCourseProgress } = require('../utils/employeeDashboard');
const { TRAINING_CATEGORIES } = require('../constants/trainingCategories');
const multer = require('multer');
const CourseFiles = require('../utils/courseFiles');

// Reads one uploaded file into memory (max 20 MB)
const receiveFile = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: CourseFiles.MAX_FILE_SIZE, files: 1 },
}).single('file');

const ICON_PATTERN = /^[a-z0-9_]{1,40}$/;   // Material Symbols icon names, e.g. "health_and_safety"
const COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;  // e.g. "#d2e8d6"

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
            Array.isArray(modules) ? modules : []
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

// @desc Update a course (details, and the curriculum when `modules` is sent)
// @route PATCH /api/courses/:id
exports.updateCourse = async (req, res) => {
    try {
        const body = req.body || {};
        if (body.title !== undefined && !String(body.title).trim()) {
            return res.status(400).json({ message: 'Course title cannot be empty' });
        }
        if (body.description !== undefined && !String(body.description).trim()) {
            return res.status(400).json({ message: 'Course description cannot be empty' });
        }
        if (body.modules !== undefined && !Array.isArray(body.modules)) {
            return res.status(400).json({ message: 'Modules must be a list' });
        }

        const updatedCourse = await Course.update(req.params.id, body);
        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating course', error: error.message });
    }
};

// @desc Delete a course completely (cascades to modules, lessons and employee progress)
// @route DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
    try {
        const deletedCourse = await Course.delete(req.params.id);
        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({ message: 'Course successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting course', error: error.message });
    }
};

// @desc List categories. `categories` = names only (used by older code), `items` = full details
// @route GET /api/courses/meta/categories
exports.getCategories = async (req, res) => {
    try {
        const items = await Category.findAll();
        return res.json({ categories: items.map(item => item.name), items });
    } catch (tableError) {
        // Fallback: the course_categories table is missing (SQL script not run yet)
        try {
            const courses = await Course.findAll();
            const fromCourses = courses.map(course => course.category).filter(Boolean);
            const categories = Array.from(new Set([...TRAINING_CATEGORIES, ...fromCourses]));
            return res.json({ categories, items: [] });
        } catch (error) {
            return res.status(500).json({ message: 'Unable to load categories.', error: error.message });
        }
    }
};

// @desc Add a category
// @route POST /api/courses/meta/categories
exports.createCategory = async (req, res) => {
    try {
        const name = String(req.body?.name || '').trim().replace(/\s+/g, ' ');
        const icon = req.body?.icon || 'school';
        const color = req.body?.color || '#dae8be';

        if (!name) {
            return res.status(400).json({ message: 'Category name is required.' });
        }
        if (name.length > 50) {
            return res.status(400).json({ message: 'Category name must be 50 characters or fewer.' });
        }
        if (!ICON_PATTERN.test(icon) || !COLOR_PATTERN.test(color)) {
            return res.status(400).json({ message: 'Invalid icon or color.' });
        }

        const category = await Category.create({ name, icon, color });
        return res.status(201).json({ message: 'Category added', category });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'A category with this name already exists.' });
        }
        return res.status(500).json({ message: 'Unable to add category.', error: error.message });
    }
};

// @desc Remove a category, but only if no course uses it
// @route DELETE /api/courses/meta/categories/:categoryId
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        const usedBy = await Course.countByCategory(category.name);
        if (usedBy > 0) {
            return res.status(409).json({
                message: `${usedBy} course${usedBy === 1 ? '' : 's'} use${usedBy === 1 ? 's' : ''} "${category.name}". Move ${usedBy === 1 ? 'it' : 'them'} to another category first.`,
                usedBy,
            });
        }

        await Category.delete(category.id);
        return res.json({ message: 'Category removed' });
    } catch (error) {
        return res.status(500).json({ message: 'Unable to remove category.', error: error.message });
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

// @desc Upload a document for a lesson (admin only)
// @route POST /api/courses/uploads   (form field name: "file")
exports.uploadLessonFile = (req, res) => {
    receiveFile(req, res, async (uploadError) => {
        if (uploadError) {
            if (uploadError.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ message: 'This file is too large. The maximum size is 20 MB.' });
            }
            return res.status(400).json({ message: 'The file could not be received. Please try again.', error: uploadError.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file was received.' });
        }
        if (!CourseFiles.isAllowedType(req.file.mimetype)) {
            return res.status(415).json({ message: 'This file type is not allowed. Upload a PDF, Word, PowerPoint or image (PNG, JPG, WEBP) file.' });
        }

        try {
            const file = await CourseFiles.uploadLessonFile({
                buffer: req.file.buffer,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
            });
            return res.status(201).json({ message: 'File uploaded', file });
        } catch (error) {
            return res.status(500).json({ message: 'Unable to store the file.', error: error.message });
        }
    });
};

// @desc Get a temporary link to open a lesson document (any logged-in user)
// @route GET /api/courses/files/url?path=lessons/...
exports.getLessonFileUrl = async (req, res) => {
    const filePath = req.query.path;
    if (!CourseFiles.isLessonFilePath(filePath)) {
        return res.status(400).json({ message: 'Invalid file.' });
    }
    try {
        const url = await CourseFiles.createFileUrl(filePath);
        return res.json({ url });
    } catch (error) {
        return res.status(404).json({ message: 'This file could not be found. It may have been removed.' });
    }
};