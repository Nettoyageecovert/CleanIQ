import api from './auth';

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
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  certifiable: boolean;
  required?: boolean;
  duration?: string;
  color?: string;
  icon?: string;
  thumbnailUrl?: string | null;
  modules?: Module[];
  createdAt?: string;
}

export interface EmployeeCourse extends Course {
  progress: number;
  progressStatus: 'completed' | 'in-progress' | 'not-started';
}

const ENDPOINT = '/courses';

export const courseApi = {
  getAllCourses: async (): Promise<Course[]> => {
    const response = await api.get<Course[]>(ENDPOINT);
    return response.data;
  },

  getCourseById: async (id: string): Promise<Course> => {
    const response = await api.get<Course>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  createCourse: async (courseData: {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    certifiable: boolean;
    required?: boolean;
    duration?: string;
    color?: string;
    icon?: string;
    thumbnailUrl?: string | null;
    modules?: Module[];
  }): Promise<Course> => {
    const response = await api.post<{ course: Course }>(ENDPOINT, courseData);
    return response.data.course;
  },

  updateCourse: async (id: string, updatedFields: Partial<Omit<Course, 'id'>>): Promise<Course> => {
    const response = await api.patch<Course>(`${ENDPOINT}/${id}`, updatedFields);
    return response.data;
  },

  deleteCourse: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`${ENDPOINT}/${id}`);
    return response.data;
  },
};

export const fetchCourseCategories = async (): Promise<string[]> => {
  const response = await api.get<{ categories: string[] }>(`${ENDPOINT}/meta/categories`);
  return response.data.categories;
};

export const fetchEmployeeCourses = async (userId: string): Promise<EmployeeCourse[]> => {
  const response = await api.get<{ courses: EmployeeCourse[] }>(`${ENDPOINT}/employee/${userId}`);
  return response.data.courses;
};

export const fetchCourses = async (): Promise<Course[]> => courseApi.getAllCourses();

export const createCourse = courseApi.createCourse;
