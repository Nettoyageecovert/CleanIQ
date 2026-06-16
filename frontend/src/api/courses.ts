import axios from 'axios';

// Define what a course looks like on the frontend
export interface Course {
  id: string;
  title: string;
  description: string;
  createdAt?: string;
}

const API_URL = '/api/courses';

export const courseApi = {
    // Fetch all courses (used by both employee my courses page and employer side)
    getAllCourses: async (): Promise<Course[]> => {
        const response = await axios.get(API_URL);
        return response.data;
    },

    // Fetch a single course by ID
    getCourseById = async (id: string): Promise<Course[]> => {
        const response = await axios.get('${API_URL}/${id}');
        return response.data;
    },

    // Create a new course (employer side)
    createCourse = async (courseData: Omit<Course, 'id' | 'createdAt'>): Promise<Course> => {
        const response = await axios.post(API_URL, courseData);
        return response.data;
    },

    // Partially update a course (Employer side)
    updateCourse = async (id: string, updatedFields: Partial<Omit<Course, 'id'>>): Promise<Course> => {
        const response = await axios.patch(`${API_URL}/${id}`, updatedFields);
        return response.data;
    },

    // Delete a course (Employer side)
    deleteCourse = async (id: string): Promise<{ message: string }> => {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    }
};


export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

// Register a new user
export const registerUser = async (data: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

// Login an existing user
export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export default api;