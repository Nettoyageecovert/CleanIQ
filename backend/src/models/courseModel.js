// This will act as a temporary database table until the switch to supabase is made
let courses = [
    {
        id: "1",
        title: "Safety Protocols 101",
        description: "Essential guidelines for chemical handling and occupational hazard prevention in residential spaces.",
        createdAt: new Date()        
    },
    {
        id: "2",
        title: "Eco-Friendly Disposal",
        description: "Advanced techniques for waste management and sustainable product lifecycle in professional cleaning.",
        createdAt: new Date() 
    }
];

// Mimic database queries
const Course = {
    findAll: async() => {
        return courses;
    },

    findById: async (id) => {
        return courses.find(course => course.id === id);
    },

    create: async (courseData) => {
        const newCourse = {
            id: Date.now().toString(), //temp id gen
            ...courseData,
            createdAt: new Date()
        };
        courses.push(newCourse);
        return newCourse;
    },

    update: async (id, updatedFields) => {
        const index = courses.findIndex(course => course.id === id);
        if (index === -1) return null;
        
        courses[index] = { ...courses[index], ...updatedFields };
        return courses[index];
    },

    delete: async (id) => {
        const index = courses.findIndex(course => course.id === id);
        if (index === -1) return false;
        
        courses.splice(index, 1);
        return true;
    }
};

module.exports = Course;