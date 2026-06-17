const supabase = require('../config/supabase');

const Course = {
    // get ALL courses
    findAll: async () => {
        const { data, error } = await supabase.from('courses').select('*');
        if (error) throw error;
        return data;
    },

    // get one specific course by ID
    findById: async (courseId) => {
        const { data, error } = await supabase.from('courses')
            .select(`
                *,
                course_modules (
                    id, title, sort_order,
                    module_lessons (id, title, type, meta, sort_order)
                )
            `)
            .eq('id', courseId)
            .order('sort_order', { foreignTable: 'course_modules', ascending: true })
            .order('sort_order', { foreignTable: 'course_modules.module_lessons', ascending: true })
            .single(); // expect exactly one object back instead of an array

        if (error) {
            if (error.code === 'PGRST116') return null;; // postgrest code for no rows found
            throw error;
        }
        return data;
    },

    // Fetch full nested course data for the Employee Side
    findByEmployeeId: async (userId) => {
        const { data, error } = await supabase.from('courses')
            .select(`
                *,
                employee_courses!left(progress, status),
                course_modules (
                    id, title, sort_order,
                    module_lessons (id, title, type, meta, sort_order)
                )
            `)
            .eq('employee_courses.user_id', userId)
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

    // relational deep-insert for the employer punlishing side
    createFullCourse: async (courseData, modulesArray) => {
        // insert course core foundations
        const { data: course, error: courseError } = await supabase.from('courses')
            .insert([{
                title: courseData.title,
                description: courseData.description,
                category: courseData.category,
                difficulty: courseData.difficulty,
                certifiable: courseData.certifiable,
                icon: 'menu_book',
                color: '#efeeea'
            }]).select().single();
        
        if (courseError) throw courseError;

        // loop through and insert each module
        for (let i = 0; i < modulesArray.length; i++) {
            const currentMod = modulesArray[i];
            
            const { data: insertedModule, error: modError } = await supabase
                .from('course_modules')
                .insert([{
                    course_id: course.id,
                    title: currentMod.title || `Module ${i + 1}`,
                    sort_order: i
                }]).select().single();

            if (modError) throw modError;

            // insert the lessons belonging to this module
            if (currentMod.lessons && currentMod.lessons.length > 0) {
                const lessonsToInsert = currentMod.lessons.map((lesson, j) => ({
                    module_id: insertedModule.id,
                    title: lesson.title || 'Untitled Lesson',
                    type: lesson.type,
                    meta: lesson.meta,
                    sort_order: j
                }));

                const { error: lessonError } = await supabase.from('module_lessons').insert(lessonsToInsert);

                if (lessonError) throw lessonError;
            }
        }

        return course;
    },

    // update core course details
    update: async (courseId, updateData) => {
        const { data, error } = await supabase
            .from('courses')
            .update({
                title: updateData.title,
                description: updateData.description,
                category: updateData.category,
                difficulty: updateData.difficulty,
                certifiable: updateData.certifiable,
                thumbnail_url: updateData.thumbnailUrl
            })
            .eq('id', courseId)
            .select()
            .single();

        if (error) return null;
        return data;
    },

    // delete a course completely
    delete: async (courseId) => {
        const { data, error } = await supabase
            .from('courses')
            .delete()
            .eq('id', courseId)
            .select()
            .single();

        if (error) return null;
        return data;
    }
};

module.exports = Course;