import api from './auth';

export interface Lesson {
  id?: string;
  title: string;
  type: 'video' | 'document';
  meta: string;
  filePath?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
}

export interface Module {
  id?: string;
  title: string;
  description?: string;
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

// A course exactly as the backend sends it in the "all courses" list (database column names)
export interface CourseRow {
  id: string;
  title: string;
  description: string;
  category: string | null;
  difficulty: string | null;
  certifiable: boolean | null;
  required: boolean | null;
  duration: string | null;
  color: string | null;
  icon: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
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

// ─── Admin: course list ────────────────────────────────────────────────────────

export const fetchCourseRows = async (): Promise<CourseRow[]> => {
  const response = await api.get<CourseRow[]>(ENDPOINT);
  return response.data;
};

// A draft is marked by duration === 'draft'
export const isDraftCourse = (course: { duration?: string | null }) => course.duration === 'draft';

// ─── Admin: load a course to edit it ───────────────────────────────────────────

interface CourseDetailsRow extends CourseRow {
  course_modules?: {
    id: string;
    title: string;
    description?: string | null;
    sort_order: number | null;
    module_lessons?: {
      id: string;
      title: string;
      type: string;
      meta: string | null;
      sort_order: number | null;
      file_path?: string | null;
      file_name?: string | null;
      file_size?: number | string | null;
      file_type?: string | null;
    }[];
  }[];
}

const bySortOrder = (a: { sort_order: number | null }, b: { sort_order: number | null }) =>
  (a.sort_order ?? 0) - (b.sort_order ?? 0);

export const fetchCourseForEdit = async (id: string): Promise<Course> => {
  const response = await api.get<CourseDetailsRow>(`${ENDPOINT}/${id}`);
  const row = response.data;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category ?? '',
    difficulty: row.difficulty ?? 'Intermediate',
    certifiable: row.certifiable ?? false,
    required: row.required ?? false,
    duration: row.duration ?? undefined,
    color: row.color ?? undefined,
    icon: row.icon ?? undefined,
    thumbnailUrl: row.thumbnail_url,
    createdAt: row.created_at,
    modules: [...(row.course_modules ?? [])].sort(bySortOrder).map(module => ({
      id: module.id,
      title: module.title,
      description: module.description ?? '',
      lessons: [...(module.module_lessons ?? [])].sort(bySortOrder).map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        type: lesson.type === 'document' ? 'document' : 'video',
        meta: lesson.meta ?? '',
        filePath: lesson.file_path ?? null,
        fileName: lesson.file_name ?? null,
        fileSize: lesson.file_size == null ? null : Number(lesson.file_size),
        fileType: lesson.file_type ?? null,
      })),
    })),
  };
};

// Same data, used by the employee course page
export const fetchCourseDetails = fetchCourseForEdit;

// ─── Admin: categories ─────────────────────────────────────────────────────────

export const fetchCategoryItems = async (): Promise<CourseCategory[]> => {
  const response = await api.get<{ categories: string[]; items?: CourseCategory[] }>(`${ENDPOINT}/meta/categories`);
  return response.data.items ?? [];
};

export const addCourseCategory = async (data: { name: string; icon?: string; color?: string }): Promise<CourseCategory> => {
  const response = await api.post<{ category: CourseCategory }>(`${ENDPOINT}/meta/categories`, data);
  return response.data.category;
};

export const removeCourseCategory = async (categoryId: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`${ENDPOINT}/meta/categories/${categoryId}`);
  return response.data;
};

// Turns any request error into a sentence we can show the admin
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const data = (error as { response?: { data?: { message?: unknown } } }).response?.data;
    if (data && typeof data.message === 'string' && data.message) return data.message;
  }
  return fallback;
};

// ─── Lesson documents ──────────────────────────────────────────────────────────

export const MAX_LESSON_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
export const ACCEPTED_LESSON_FILES = '.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp';
const ACCEPTED_EXTENSIONS = ACCEPTED_LESSON_FILES.split(',');

export interface UploadedLessonFile {
  filePath: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

// Checks a file before uploading. Returns an error sentence, or null when the file is fine.
export const checkLessonFile = (file: File): string | null => {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    return 'This file type is not allowed. Upload a PDF, Word, PowerPoint or image (PNG, JPG, WEBP) file.';
  }
  if (file.size > MAX_LESSON_FILE_SIZE) {
    return 'This file is too large. The maximum size is 20 MB.';
  }
  return null;
};

// Uploads one file. onProgress receives 0–100 while it uploads.
export const uploadLessonFile = async (file: File, onProgress?: (percent: number) => void): Promise<UploadedLessonFile> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<{ file: UploadedLessonFile }>(`${ENDPOINT}/uploads`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: event => {
      if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  return response.data.file;
};

export const fetchLessonFileUrl = async (filePath: string): Promise<string> => {
  const response = await api.get<{ url: string }>(`${ENDPOINT}/files/url`, { params: { path: filePath } });
  return response.data.url;
};

// Opens a lesson document in a new tab. The tab is opened first (before waiting
// for the link) so the browser doesn't treat it as an unwanted pop-up.
export const openLessonFile = async (filePath: string): Promise<void> => {
  const newTab = window.open('', '_blank');
  try {
    const url = await fetchLessonFileUrl(filePath);
    if (newTab) {
      newTab.opener = null;
      newTab.location.href = url;
    } else {
      window.location.href = url;
    }
  } catch (error) {
    newTab?.close();
    throw error;
  }
};

export const formatFileSize = (bytes?: number | null): string => {
  if (bytes == null || !Number.isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};