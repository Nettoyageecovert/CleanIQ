const supabase = require('../config/supabase');
const { isLessonFilePath, removeFiles } = require('../utils/courseFiles');

// Course fields the app is allowed to change, mapped to their database column names.
const EDITABLE_FIELDS = {
    title: 'title',
    description: 'description',
    category: 'category',
    difficulty: 'difficulty',
    certifiable: 'certifiable',
    required: 'required',
    duration: 'duration',
    color: 'color',
    icon: 'icon',
    thumbnailUrl: 'thumbnail_url',
};

// The file details a lesson may carry. Only real uploaded paths are accepted.
const lessonFileColumns = (lesson) => {
    if (!isLessonFilePath(lesson.filePath)) {
        return { file_path: null, file_name: null, file_size: null, file_type: null };
    }
    const size = Number(lesson.fileSize);
    return {
        file_path: lesson.filePath,
        file_name: String(lesson.fileName || '').trim().slice(0, 200) || null,
        file_size: Number.isFinite(size) && size >= 0 ? Math.round(size) : null,
        file_type: String(lesson.fileType || '').trim().slice(0, 120) || null,
    };
};

const moduleDescription = (value) => {
    const text = String(value ?? '').trim().slice(0, 2000);
    return text || null;
};

// All file paths that the lessons of a course point to
const getCourseFilePaths = async (courseId) => {
    const { data, error } = await supabase
        .from('course_modules')
        .select('module_lessons (file_path)')
        .eq('course_id', courseId);
    if (error) throw error;
    return data.flatMap(module => (module.module_lessons || []).map(lesson => lesson.file_path)).filter(Boolean);
};

const filePathsIn = (modulesArray) => modulesArray
    .flatMap(module => (Array.isArray(module.lessons) ? module.lessons : []))
    .map(lesson => lesson.filePath)
    .filter(isLessonFilePath);

// Inserts modules (and their lessons) for a course, in order.
// If anything fails halfway, it removes the modules it just added, so we never
// leave a half-saved curriculum behind. Returns the ids of the new modules.
const insertModules = async (courseId, modulesArray) => {
    const insertedIds = [];
    try {
        for (let i = 0; i < modulesArray.length; i++) {
            const currentMod = modulesArray[i];

            const { data: insertedModule, error: modError } = await supabase
                .from('course_modules')
                .insert([{
                    course_id: courseId,
                    title: (currentMod.title || '').trim() || `Module ${i + 1}`,
                    description: moduleDescription(currentMod.description),
                    sort_order: i,
                }]).select().single();

            if (modError) throw modError;
            insertedIds.push(insertedModule.id);

            const lessons = Array.isArray(currentMod.lessons) ? currentMod.lessons : [];
            if (lessons.length > 0) {
                const lessonsToInsert = lessons.map((lesson, j) => ({
                    module_id: insertedModule.id,
                    title: (lesson.title || '').trim() || 'Untitled Lesson',
                    type: lesson.type === 'document' ? 'document' : 'video',
                    meta: lesson.meta,
                    sort_order: j,
                    ...lessonFileColumns(lesson),
                }));

                const { error: lessonError } = await supabase.from('module_lessons').insert(lessonsToInsert);
                if (lessonError) throw lessonError;
            }
        }
        return insertedIds;
    } catch (error) {
        if (insertedIds.length > 0) {
            // Clean up (lessons are removed automatically by the database)
            await supabase.from('course_modules').delete().in('id', insertedIds);
        }
        throw error;
    }
};

const Course = {
    // get ALL courses (newest first)
    findAll: async () => {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    // get one specific course by ID, with its modules and lessons
    findById: async (courseId) => {
        const { data, error } = await supabase.from('courses')
            .select(`
                *,
                course_modules (
                    id, title, description, sort_order,
                    module_lessons (id, title, type, meta, sort_order, file_path, file_name, file_size, file_type)
                )
            `)
            .eq('id', courseId)
            .order('sort_order', { foreignTable: 'course_modules', ascending: true })
            .order('sort_order', { foreignTable: 'course_modules.module_lessons', ascending: true })
            .maybeSingle(); // returns null instead of an error when nothing is found

        if (error) {
            if (error.code === '22P02') return null; // the id is not a valid id format
            throw error;
        }
        return data;
    },

    // Fetch full nested course data for the Employee Side (drafts are hidden)
    findByEmployeeId: async (userId) => {
        const { data, error } = await supabase.from('courses')
            .select(`
                *,
                employee_courses!left(progress, status),
                course_modules (
                    id, title, description, sort_order,
                    module_lessons (id, title, type, meta, sort_order, file_path, file_name, file_size, file_type)
                )
            `)
            .eq('employee_courses.user_id', userId)
            .or('duration.is.null,duration.neq.draft')
            .order('sort_order', { foreignTable: 'course_modules', ascending: true })
            .order('sort_order', { foreignTable: 'course_modules.module_lessons', ascending: true });

        if (error) throw error;

        return data.map(course => {
            const progressRecord = course.employee_courses?.[0] || null;
            return {
                id: course.id,
                title: course.title,
                description: course.description,
                category: course.category,
                difficulty: course.difficulty,
                certifiable: course.certifiable,
                thumbnailUrl: course.thumbnail_url,
                color: course.color,
                icon: course.icon,
                progress: progressRecord ? progressRecord.progress : 0,
                status: progressRecord ? progressRecord.status : 'not-started',
                modules: course.course_modules || []
            };
        });
    },

    // relational deep-insert for the employer publishing side
    createFullCourse: async (courseData, modulesArray) => {
        // insert course core foundations
        const { data: course, error: courseError } = await supabase.from('courses')
            .insert([{
                title: courseData.title,
                description: courseData.description,
                category: courseData.category,
                difficulty: courseData.difficulty,
                certifiable: courseData.certifiable,
                required: courseData.required ?? Boolean(courseData.certifiable),
                duration: courseData.duration ?? 'Self-paced',
                icon: courseData.icon || 'menu_book',
                color: courseData.color || '#efeeea',
                thumbnail_url: courseData.thumbnailUrl || null,
            }]).select().single();

        if (courseError) throw courseError;

        try {
            await insertModules(course.id, modulesArray);
        } catch (error) {
            // Don't leave a course without its curriculum behind
            await supabase.from('courses').delete().eq('id', course.id);
            throw error;
        }

        return course;
    },

    // update a course. If `modules` is sent, the curriculum is replaced too.
    // Returns null when the course does not exist.
    update: async (courseId, updateData) => {
        const fields = {};
        for (const [key, column] of Object.entries(EDITABLE_FIELDS)) {
            if (updateData[key] !== undefined) fields[column] = updateData[key];
        }

        let course;
        if (Object.keys(fields).length > 0) {
            const { data, error } = await supabase
                .from('courses')
                .update(fields)
                .eq('id', courseId)
                .select()
                .maybeSingle();
            if (error) {
                if (error.code === '22P02') return null;
                throw error;
            }
            course = data;
        } else {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .maybeSingle();
            if (error) {
                if (error.code === '22P02') return null;
                throw error;
            }
            course = data;
        }

        if (!course) return null;

        if (Array.isArray(updateData.modules)) {
            // Remember the old modules, add the new ones, and only then remove the old ones.
            // That way, if saving the new curriculum fails, the old one is still there.
            const { data: oldModules, error: oldError } = await supabase
                .from('course_modules')
                .select('id')
                .eq('course_id', courseId);
            if (oldError) throw oldError;
            const oldFilePaths = await getCourseFilePaths(courseId);

            await insertModules(courseId, updateData.modules);

            const oldIds = oldModules.map(m => m.id);
            if (oldIds.length > 0) {
                const { error: deleteError } = await supabase
                    .from('course_modules')
                    .delete()
                    .in('id', oldIds);
                if (deleteError) throw deleteError;
            }

            // Delete files that the new curriculum no longer uses
            const keptPaths = new Set(filePathsIn(updateData.modules));
            await removeFiles(oldFilePaths.filter(filePath => !keptPaths.has(filePath)));
        }

        return course;
    },

    // delete a course completely (modules, lessons and employee progress go with it)
    // Returns null when the course does not exist.
    delete: async (courseId) => {
        let filePaths = [];
        try {
            filePaths = await getCourseFilePaths(courseId);
        } catch (error) {
            if (error.code !== '22P02') throw error;
        }

        const { data, error } = await supabase
            .from('courses')
            .delete()
            .eq('id', courseId)
            .select()
            .maybeSingle();

        if (error) {
            if (error.code === '22P02') return null;
            throw error;
        }
        if (data) await removeFiles(filePaths);
        return data;
    },

    // how many courses use a given category
    countByCategory: async (categoryName) => {
        const { count, error } = await supabase
            .from('courses')
            .select('id', { count: 'exact', head: true })
            .eq('category', categoryName);
        if (error) throw error;
        return count || 0;
    },
};

module.exports = Course;