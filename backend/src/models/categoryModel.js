const supabase = require('../config/supabase');

const Category = {
    // all categories, oldest first (so the original ones stay at the top)
    findAll: async () => {
        const { data, error } = await supabase
            .from('course_categories')
            .select('id, name, icon, color, created_at')
            .order('created_at', { ascending: true })
            .order('name', { ascending: true });
        if (error) throw error;
        return data;
    },

    findById: async (categoryId) => {
        const { data, error } = await supabase
            .from('course_categories')
            .select('id, name, icon, color, created_at')
            .eq('id', categoryId)
            .maybeSingle();
        if (error) {
            if (error.code === '22P02') return null; // not a valid id format
            throw error;
        }
        return data;
    },

    create: async ({ name, icon, color }) => {
        const { data, error } = await supabase
            .from('course_categories')
            .insert([{ name, icon, color }])
            .select('id, name, icon, color, created_at')
            .single();
        if (error) throw error; // error.code '23505' means the name already exists
        return data;
    },

    delete: async (categoryId) => {
        const { data, error } = await supabase
            .from('course_categories')
            .delete()
            .eq('id', categoryId)
            .select('id, name')
            .maybeSingle();
        if (error) throw error;
        return data;
    },
};

module.exports = Category;