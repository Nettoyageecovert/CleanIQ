import api from './auth';

// Define what a course looks like on the frontend
export interface Lesson {
  id?: string;
  title: string;
  type: 'video' | 'document';
  meta: string;
}

export interface Module {
  id?: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  certifiable: boolean;
  thumbnailUrl?: string | null;
  modules?: Module[];
  createdAt?: string;
}

const ENDPOINT = '/courses';

export const courseApi = {
    // Fetch all courses (used by both employee my courses page and employer side)
    getAllCourses: async (): Promise<Course[]> => {
        const response = await api.get<Course[]>(ENDPOINT);
        return response.data;
    },

    // Fetch a single course by ID
    getCourseById: async (id: string): Promise<Course> => {
        const response = await api.get<Course>(`${ENDPOINT}/${id}`);
        return response.data;
    },

    // Create a new course (employer side)
    createCourse: async (courseData: Omit<Course, 'id' | 'createdAt'>): Promise<Course> => {
        const response = await api.post<Course>(ENDPOINT, courseData);
        return response.data;
    },

    // Partially update a course (Employer side)
    updateCourse: async (id: string, updatedFields: Partial<Omit<Course, 'id'>>): Promise<Course> => {
        const response = await api.patch<Course>(`${ENDPOINT}/${id}`, updatedFields);
        return response.data;
    },

    // Delete a course (Employer side)
    deleteCourse: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`${ENDPOINT}/${id}`);
        return response.data;
    }
};