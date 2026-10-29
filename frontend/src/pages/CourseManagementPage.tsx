import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmployerSidebar from '../components/EmployerSidebar';
import {
  ACCEPTED_LESSON_FILES,
  checkLessonFile,
  courseApi,
  fetchCategoryItems,
  fetchCourseCategories,
  fetchCourseForEdit,
  formatFileSize,
  getErrorMessage,
  isDraftCourse,
  openLessonFile,
  uploadLessonFile,
} from '../api/courses';
import type { CourseCategory } from '../api/courses';
import { TRAINING_CATEGORIES, getCategoryIcon } from '../constants/trainingCategories';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'document';
  meta: string;
  filePath: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  uploadProgress: number | null; // 0–100 while uploading, otherwise null
  uploadError: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  expanded: boolean;
  lessons: Lesson[];
}

interface CourseForm {
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  certifiable: boolean;
}

const CATEGORIES: string[] = [...TRAINING_CATEGORIES];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;

const createLesson = (type: 'video' | 'document'): Lesson => ({
  id: crypto.randomUUID(),
  title: '',
  type,
  meta: type === 'video' ? '0:00 mins' : '0 MB',
  filePath: null,
  fileName: null,
  fileSize: null,
  fileType: null,
  uploadProgress: null,
  uploadError: '',
});

const createModule = (): Module => ({
  id: crypto.randomUUID(),
  title: '',
  description: '',
  expanded: true,
  lessons: [],
});

// "The Looseners.pdf" -> "The Looseners"
const titleFromFileName = (name: string) => name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();

const toDifficulty = (value: string): CourseForm['difficulty'] =>
  (DIFFICULTIES as readonly string[]).includes(value) ? (value as CourseForm['difficulty']) : 'Intermediate';

export default function CourseManagementPage() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const isEdit = Boolean(courseId);

  const [form, setForm] = useState<CourseForm>({
    title: '',
    description: '',
    category: CATEGORIES[0],
    difficulty: 'Intermediate',
    certifiable: true,
  });

  const [modules, setModules] = useState<Module[]>([createModule()]);
  const [categories, setCategories] = useState<string[]>(CATEGORIES);
  const [categoryItems, setCategoryItems] = useState<CourseCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [isLoadingCourse, setIsLoadingCourse] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [wasDraft, setWasDraft] = useState(false);

  const [thumbnail, setThumbnail] = useState<string | null>(null);

  // Load the categories (from the database, with the built-in list as a backup)
  useEffect(() => {
    const applyNames = (names: string[]) => {
      setCategories(names);
      if (!isEdit && names.length > 0) {
        // New course: make sure the selected category actually exists
        setForm(prev => (names.includes(prev.category) ? prev : { ...prev, category: names[0] }));
      }
    };

    fetchCategoryItems()
      .then(items => {
        if (items.length > 0) {
          setCategoryItems(items);
          applyNames(items.map(item => item.name));
        } else {
          return fetchCourseCategories().then(applyNames);
        }
      })
      .catch(() => applyNames(CATEGORIES));
  }, [isEdit]);

  // Edit mode: load the course and fill in the form
  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;

    fetchCourseForEdit(courseId)
      .then(course => {
        if (cancelled) return;
        setForm({
          title: course.title,
          description: course.description,
          category: course.category,
          difficulty: toDifficulty(course.difficulty),
          certifiable: course.certifiable,
        });
        const loadedModules = (course.modules ?? []).map((module, index) => ({
          id: crypto.randomUUID(),
          title: module.title,
          description: module.description ?? '',
          expanded: index === 0,
          lessons: module.lessons.map(lesson => ({
            ...createLesson(lesson.type),
            title: lesson.title,
            meta: lesson.meta,
            filePath: lesson.filePath ?? null,
            fileName: lesson.fileName ?? null,
            fileSize: lesson.fileSize ?? null,
            fileType: lesson.fileType ?? null,
          })),
        }));
        setModules(loadedModules.length > 0 ? loadedModules : [createModule()]);
        // Old "blob:" thumbnails only worked in the browser tab that uploaded them
        setThumbnail(course.thumbnailUrl && !course.thumbnailUrl.startsWith('blob:') ? course.thumbnailUrl : null);
        setWasDraft(isDraftCourse(course));
      })
      .catch(error => {
        if (cancelled) return;
        const status = (error as { response?: { status?: number } }).response?.status;
        setLoadError(status === 404
          ? 'This course no longer exists. It may have been deleted.'
          : getErrorMessage(error, 'Unable to load this course. Please try again.'));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCourse(false);
      });

    return () => { cancelled = true; };
  }, [courseId]);

  // If this course uses a category that isn't in the list, still show it in the dropdown
  const categoryOptions = form.category && !categories.includes(form.category)
    ? [form.category, ...categories]
    : categories;

  const updateForm = (key: keyof CourseForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const addModule = () => setModules(prev => [...prev, createModule()]);

  const removeModule = (id: string) => setModules(prev => prev.filter(m => m.id !== id));

  const toggleModule = (id: string) =>
    setModules(prev => prev.map(m => m.id === id ? { ...m, expanded: !m.expanded } : m));

  const updateModuleTitle = (id: string, title: string) =>
    setModules(prev => prev.map(m => m.id === id ? { ...m, title } : m));

  const addLesson = (moduleId: string, type: 'video' | 'document') =>
    setModules(prev => prev.map(m =>
      m.id === moduleId ? { ...m, lessons: [...m.lessons, createLesson(type)] } : m
    ));

  const removeLesson = (moduleId: string, lessonId: string) =>
    setModules(prev => prev.map(m =>
      m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m
    ));

  const updateLessonTitle = (moduleId: string, lessonId: string, title: string) =>
    setModules(prev => prev.map(m =>
      m.id === moduleId
        ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, title } : l) }
        : m
    ));

  const updateModuleDescription = (id: string, description: string) =>
    setModules(prev => prev.map(m => m.id === id ? { ...m, description } : m));

  const patchLesson = (moduleId: string, lessonId: string, patch: Partial<Lesson>) =>
    setModules(prev => prev.map(m =>
      m.id === moduleId
        ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...patch } : l) }
        : m
    ));

  // ─── Document uploads ─────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<{ moduleId: string; lessonId?: string } | null>(null);

  // Opens the "choose a file" window. Without lessonId, each chosen file becomes a new lesson.
  const pickFiles = (moduleId: string, lessonId?: string) => {
    uploadTargetRef.current = { moduleId, lessonId };
    if (fileInputRef.current) {
      fileInputRef.current.multiple = !lessonId;
      fileInputRef.current.click();
    }
  };

  const startUpload = async (moduleId: string, lessonId: string, file: File) => {
    const problem = checkLessonFile(file);
    if (problem) {
      patchLesson(moduleId, lessonId, { uploadProgress: null, uploadError: problem });
      return;
    }
    patchLesson(moduleId, lessonId, { uploadProgress: 0, uploadError: '' });
    try {
      const uploaded = await uploadLessonFile(file, percent =>
        patchLesson(moduleId, lessonId, { uploadProgress: Math.min(percent, 99) }));
      patchLesson(moduleId, lessonId, {
        ...uploaded,
        meta: formatFileSize(uploaded.fileSize),
        uploadProgress: null,
        uploadError: '',
      });
    } catch (error) {
      patchLesson(moduleId, lessonId, {
        uploadProgress: null,
        uploadError: getErrorMessage(error, 'Upload failed. Please try again.'),
      });
    }
  };

  const handleFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // lets the admin choose the same file again later
    const target = uploadTargetRef.current;
    if (!target || files.length === 0) return;

    if (target.lessonId) {
      // Attach or replace the file of an existing lesson
      const lessonId = target.lessonId;
      setModules(prev => prev.map(m => m.id !== target.moduleId ? m : {
        ...m,
        lessons: m.lessons.map(l => l.id !== lessonId ? l : {
          ...l,
          title: l.title.trim() ? l.title : titleFromFileName(files[0].name),
        }),
      }));
      startUpload(target.moduleId, lessonId, files[0]);
      return;
    }

    // Each chosen file becomes a new document lesson
    const newLessons = files.map(file => ({
      ...createLesson('document'),
      title: titleFromFileName(file.name),
      meta: formatFileSize(file.size),
    }));
    setModules(prev => prev.map(m =>
      m.id === target.moduleId ? { ...m, expanded: true, lessons: [...m.lessons, ...newLessons] } : m
    ));
    newLessons.forEach((lesson, index) => startUpload(target.moduleId, lesson.id, files[index]));
  };

  const viewFile = (filePath: string) => {
    openLessonFile(filePath).catch(error =>
      setSaveError(getErrorMessage(error, 'Unable to open this file. Please try again.')));
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setThumbnail(URL.createObjectURL(file));
  };

  const buildDurationLabel = () => {
    const moduleCount = modules.filter(module => module.title.trim()).length || modules.length;
    const lessonCount = modules.reduce((sum, module) => sum + module.lessons.length, 0);
    if (lessonCount === 0) return 'Self-paced';
    return `${moduleCount} module${moduleCount !== 1 ? 's' : ''} · ${lessonCount} lesson${lessonCount !== 1 ? 's' : ''}`;
  };

  const saveCourse = async (status: 'draft' | 'published') => {
    if (!form.title.trim()) {
      setSaveError('Course title is required.');
      return;
    }
    const allLessons = modules.flatMap(module => module.lessons);
    if (allLessons.some(lesson => lesson.uploadProgress !== null)) {
      setSaveError('Please wait until all files finish uploading.');
      return;
    }
    if (allLessons.some(lesson => lesson.uploadError && !lesson.filePath)) {
      setSaveError('Some files could not be uploaded. Attach them again or remove those lessons.');
      return;
    }

    // Icon and color come from the category (database first, built-in list as a backup)
    const categoryItem = categoryItems.find(item => item.name === form.category);
    const iconStyle = categoryItem
      ? { icon: categoryItem.icon, color: categoryItem.color }
      : getCategoryIcon(form.category);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || form.title.trim(),
      category: form.category,
      difficulty: form.difficulty,
      certifiable: form.certifiable,
      required: form.certifiable,
      duration: status === 'draft' ? 'draft' : buildDurationLabel(),
      color: iconStyle.color,
      icon: iconStyle.icon,
      thumbnailUrl: thumbnail,
      modules: modules.map(({ title, description, lessons }) => ({
        title,
        description: description.trim(),
        lessons: lessons.map(lesson => ({
          title: lesson.title,
          type: lesson.type,
          meta: lesson.meta,
          filePath: lesson.filePath,
          fileName: lesson.fileName,
          fileSize: lesson.fileSize,
          fileType: lesson.fileType,
        })),
      })),
    };

    setIsSaving(true);
    setSaveError('');
    try {
      if (isEdit && courseId) {
        await courseApi.updateCourse(courseId, payload);
      } else {
        await courseApi.createCourse(payload);
      }
      const verb = isEdit ? 'updated' : 'created';
      navigate('/employer/courses', {
        state: { notice: `"${payload.title}" was ${verb}${status === 'draft' ? ' and saved as a draft' : ' and published'}.` },
      });
    } catch (error) {
      setSaveError(getErrorMessage(error, 'Unable to save course. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = () => saveCourse('published');
  const handleSaveDraft = () => saveCourse('draft');

  const inputClass = 'theme-input w-full px-4 py-3 rounded-xl text-[15px] border outline-none transition-all';

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.target.style.borderColor = '#4f6355';
      e.target.style.boxShadow = '0 0 0 3px rgba(79,99,85,0.1)';
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.target.style.borderColor = '#e1e4e0';
      e.target.style.boxShadow = 'none';
    },
  };

  const infoText = saveError
    || (isEdit
      ? `This course is currently ${wasDraft ? 'a draft' : 'published'}. Your changes replace the saved version.`
      : 'Courses are saved to your training library when you publish or save a draft.');

  return (
    <div className="theme-page min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <EmployerSidebar />
      <input ref={fileInputRef} type="file" className="hidden" accept={ACCEPTED_LESSON_FILES}
        onChange={handleFilesChosen} aria-hidden="true" tabIndex={-1} />

      <div className="lg:ml-72 flex flex-col min-h-screen">
        <header className="theme-header-bar h-20 sticky top-0 z-40 flex items-center justify-between px-8 border-b">
          <h1 className="text-[22px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
            CleanIQ Admin
          </h1>
          <div className="flex items-center gap-3">
            {['notifications', 'settings'].map(icon => (
              <button key={icon} aria-label={icon} className="w-10 h-10 flex items-center justify-center rounded-full transition-colors theme-text-secondary"
                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-nav-employer)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span className="material-symbols-outlined">{icon}</span>
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 px-8 py-10 max-w-[1100px] mx-auto w-full">
          <div className="mb-10">
            <nav className="flex items-center gap-1 mb-2">
              <span className="text-[12px] font-bold uppercase tracking-wider theme-muted">Admin Console</span>
              <span className="material-symbols-outlined text-[14px] theme-muted">chevron_right</span>
              <button onClick={() => navigate('/employer/courses')}
                className="text-[12px] font-bold uppercase tracking-wider theme-muted hover:underline">
                Course Management
              </button>
              <span className="material-symbols-outlined text-[14px] theme-muted">chevron_right</span>
              <span className="text-[12px] font-bold uppercase tracking-wider theme-text-primary">
                {isEdit ? 'Edit Course' : 'New Course'}
              </span>
            </nav>
            <h2 className="text-[32px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {isEdit ? 'Edit Course' : 'Create New Course'}
            </h2>
            <p className="text-[15px] mt-1 theme-text-secondary">
              {isEdit
                ? 'Update the details, curriculum and settings of this course.'
                : 'Design an immersive learning experience. Fill in the details, structure your curriculum, and configure settings.'}
            </p>
          </div>

          {isLoadingCourse && (
            <p className="text-[15px] py-16 text-center theme-muted">Loading course...</p>
          )}

          {!isLoadingCourse && loadError && (
            <div className="theme-section-card rounded-2xl p-10 border flex flex-col items-center gap-4 text-center"
              style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="material-symbols-outlined text-[36px]" style={{ color: '#ba1a1a' }}>error</span>
              <p className="text-[15px] theme-text-primary">{loadError}</p>
              <button onClick={() => navigate('/employer/courses')}
                className="px-6 py-3 rounded-full text-[14px] font-bold"
                style={{ background: '#172a1e', color: '#ffffff' }}>
                Back to All Courses
              </button>
            </div>
          )}

          {!isLoadingCourse && !loadError && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <section className="theme-section-card rounded-2xl p-6 border"
                    style={{ boxShadow: '0 4px 20px rgba(45,64,51,0.05)', borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="material-symbols-outlined text-[22px]" style={{ color: '#705a49' }}>foundation</span>
                      <h3 className="text-[22px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Course Foundations
                      </h3>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[13px] font-bold uppercase tracking-wider mb-2 theme-text-secondary">
                          Course Title
                        </label>
                        <input type="text" value={form.title}
                          onChange={e => updateForm('title', e.target.value)}
                          placeholder="e.g., Chemical Safety Fundamentals"
                          className={inputClass} {...focusHandlers} />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold uppercase tracking-wider mb-2 theme-text-secondary">
                          Description
                        </label>
                        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                          <div className="theme-toolbar flex gap-1 px-3 py-2 border-b">
                            {['format_bold', 'format_italic', 'format_list_bulleted', 'link'].map(icon => (
                              <button key={icon} aria-label={icon} className="p-1.5 rounded-lg transition-colors theme-text-secondary"
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-nav)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                              </button>
                            ))}
                          </div>
                          <textarea rows={5} value={form.description}
                            onChange={e => updateForm('description', e.target.value)}
                            placeholder="Describe the learning journey of this course..."
                            className="theme-input w-full px-4 py-3 text-[15px] outline-none resize-none border-none" />
                        </div>
                      </div>
                    </div>
                  </section>
                  <section className="theme-section-card rounded-2xl p-6 border"
                    style={{ boxShadow: '0 4px 20px rgba(45,64,51,0.05)', borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[22px]" style={{ color: '#705a49' }}>account_tree</span>
                        <h3 className="text-[22px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          Curriculum Structure
                        </h3>
                      </div>
                      <button onClick={addModule}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-bold transition-all"
                        style={{ background: '#172a1e', color: '#ffffff' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#2d4033'}
                        onMouseLeave={e => e.currentTarget.style.background = '#172a1e'}>
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Add Module
                      </button>
                    </div>

                    <div className="space-y-4">
                      {modules.map((module, mIndex) => (
                        <div key={module.id} className="rounded-xl border overflow-hidden"
                          style={{ borderColor: 'rgba(23,42,30,0.15)', background: 'rgba(23,42,30,0.02)' }}>
                          <div className="px-5 py-4 flex items-center justify-between"
                            style={{ background: 'rgba(23,42,30,0.04)' }}>
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <span className="material-symbols-outlined text-[20px] cursor-grab" style={{ color: '#737873' }}>
                                drag_indicator
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="text-[11px] font-bold uppercase tracking-widest block" style={{ color: '#172a1e' }}>
                                  Module {String(mIndex + 1).padStart(2, '0')}
                                </span>
                                <input type="text" value={module.title}
                                  onChange={e => updateModuleTitle(module.id, e.target.value)}
                                  placeholder="Module title..."
                                  className="w-full text-[16px] font-bold bg-transparent border-none outline-none"
                                  style={{ color: '#1b1c1a' }} />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                              <button onClick={() => removeModule(module.id)} aria-label="Remove module"
                                className="p-1.5 rounded-lg transition-colors" style={{ color: '#737873' }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#ba1a1a'; e.currentTarget.style.background = '#ffdad6'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#737873'; e.currentTarget.style.background = 'transparent'; }}>
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                              <button onClick={() => toggleModule(module.id)} aria-label={module.expanded ? 'Collapse module' : 'Expand module'}
                                className="p-1.5 rounded-lg transition-all" style={{ color: '#172a1e' }}>
                                <span className="material-symbols-outlined text-[20px] transition-transform block"
                                  style={{ transform: module.expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                  expand_more
                                </span>
                              </button>
                            </div>
                          </div>

                          {module.expanded && (
                            <div className="p-4 space-y-3">
                              <textarea rows={2} value={module.description}
                                onChange={e => updateModuleDescription(module.id, e.target.value)}
                                placeholder="Describe what this module covers (optional)..."
                                aria-label={`Module ${mIndex + 1} description`}
                                maxLength={2000}
                                className="theme-input w-full px-4 py-3 rounded-xl text-[14px] border outline-none resize-y"
                                {...focusHandlers} />
                              {module.lessons.map(lesson => (
                                <div key={lesson.id}
                                  className="theme-lesson-row px-4 py-3 rounded-xl border group transition-all"
                                  onMouseEnter={e => e.currentTarget.style.borderColor = '#b6ccba'}
                                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                                  <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[18px] cursor-grab" style={{ color: '#c3c8c1' }}>
                                      drag_handle
                                    </span>
                                    <span className="material-symbols-outlined text-[20px]" style={{ color: '#705a49' }}>
                                      {lesson.type === 'video' ? 'video_library' : 'description'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <input type="text" value={lesson.title}
                                        onChange={e => updateLessonTitle(module.id, lesson.id, e.target.value)}
                                        placeholder={lesson.type === 'video' ? 'Lesson title...' : 'Document title...'}
                                        className="w-full bg-transparent border-none outline-none text-[14px] theme-text-primary" />
                                      {lesson.type === 'document' && (
                                        <p className={`text-[12px] mt-0.5 ${lesson.uploadError ? '' : 'truncate'}`}
                                          style={{ color: lesson.uploadError ? '#ba1a1a' : '#737873' }}>
                                          {lesson.uploadProgress !== null
                                            ? `Uploading... ${lesson.uploadProgress}%`
                                            : lesson.uploadError
                                              ? lesson.uploadError
                                              : lesson.fileName
                                                ? `File: ${lesson.fileName}`
                                                : 'No file attached yet'}
                                        </p>
                                      )}
                                    </div>
                                    <span className="text-[12px] font-bold theme-muted shrink-0">{lesson.meta}</span>
                                    {lesson.type === 'document' && lesson.uploadProgress === null && (
                                      <div className="flex items-center gap-1 shrink-0">
                                        {lesson.filePath && (
                                          <button onClick={() => viewFile(lesson.filePath as string)}
                                            className="px-3 py-1 rounded-full text-[12px] font-bold border"
                                            style={{ borderColor: '#172a1e', color: '#172a1e' }}>
                                            View
                                          </button>
                                        )}
                                        <button onClick={() => pickFiles(module.id, lesson.id)}
                                          className="px-3 py-1 rounded-full text-[12px] font-bold border"
                                          style={{ borderColor: '#705a49', color: '#705a49' }}>
                                          {lesson.filePath ? 'Replace' : 'Attach file'}
                                        </button>
                                      </div>
                                    )}
                                    <button onClick={() => removeLesson(module.id, lesson.id)} aria-label="Remove lesson"
                                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-lg transition-all shrink-0"
                                      style={{ color: '#737873' }}
                                      onMouseEnter={e => { e.currentTarget.style.color = '#ba1a1a'; e.currentTarget.style.background = '#ffdad6'; }}
                                      onMouseLeave={e => { e.currentTarget.style.color = '#737873'; e.currentTarget.style.background = 'transparent'; }}>
                                      <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                  </div>
                                  {lesson.uploadProgress !== null && (
                                    <div className="w-full h-1.5 rounded-full mt-2" style={{ background: '#efeeea' }}
                                      role="progressbar" aria-valuenow={lesson.uploadProgress} aria-valuemin={0} aria-valuemax={100}>
                                      <div className="h-full rounded-full transition-all"
                                        style={{ width: `${lesson.uploadProgress}%`, background: '#172a1e' }} />
                                    </div>
                                  )}
                                </div>
                              ))}
                              <div className="flex gap-3">
                                <button onClick={() => addLesson(module.id, 'video')}
                                  className="theme-dropzone flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[13px] font-medium">
                                  <span className="material-symbols-outlined text-[18px]">video_library</span>
                                  Add Video
                                </button>
                                <button onClick={() => pickFiles(module.id)}
                                  className="theme-dropzone flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[13px] font-medium">
                                  <span className="material-symbols-outlined text-[18px]">upload_file</span>
                                  Add Document
                                </button>
                              </div>
                              <p className="text-[11px] theme-muted">
                                Documents: PDF, Word, PowerPoint or images (PNG, JPG, WEBP), up to 20 MB each. You can choose several files at once.
                              </p>
                            </div>
                          )}
                        </div>
                      ))}

                      <button onClick={addModule}
                        className="theme-dropzone w-full py-8 rounded-2xl flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[36px]">add_circle</span>
                        <span className="text-[13px] font-medium">Click to add a new module</span>
                      </button>
                    </div>
                  </section>
                </div>
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <section className="theme-section-card rounded-2xl p-6 border"
                    style={{ boxShadow: '0 4px 20px rgba(45,64,51,0.05)', borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="material-symbols-outlined text-[22px]" style={{ color: '#705a49' }}>palette</span>
                      <h3 className="text-[20px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Course Aesthetic
                      </h3>
                    </div>
                    <label className="block cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                      <div className="theme-dropzone aspect-video rounded-xl flex flex-col items-center justify-center gap-2 overflow-hidden">
                        {thumbnail ? (
                          <img src={thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center theme-panel">
                              <span className="material-symbols-outlined text-[24px] theme-text-primary">cloud_upload</span>
                            </div>
                            <p className="text-[13px] font-bold theme-dropzone-title">Upload Course Thumbnail</p>
                            <p className="text-[11px] text-center px-4 theme-muted">PNG, JPG · 1200×675px · Max 5MB</p>
                          </>
                        )}
                      </div>
                    </label>
                    <div className="theme-tip mt-4 p-3 rounded-xl flex items-start gap-3">
                      <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5"
                        style={{ fontVariationSettings: "'FILL' 1" }}>
                        auto_awesome
                      </span>
                      <p className="text-[12px] leading-relaxed">
                        Use clear, high-resolution imagery to inspire your employees.
                      </p>
                    </div>
                  </section>
                  <section className="theme-section-card rounded-2xl p-6 border"
                    style={{ boxShadow: '0 4px 20px rgba(45,64,51,0.05)', borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="material-symbols-outlined text-[22px]" style={{ color: '#705a49' }}>tune</span>
                      <h3 className="text-[20px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Configuration
                      </h3>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[13px] font-bold uppercase tracking-wider mb-2 theme-text-secondary">Category</label>
                        <select value={form.category} onChange={e => updateForm('category', e.target.value)}
                          className={inputClass} {...focusHandlers}>
                          {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <p className="text-[11px] mt-1.5 theme-muted">
                          Categories are managed on the Course Management page.
                        </p>
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold uppercase tracking-wider mb-3 theme-text-secondary">Difficulty Level</label>
                        <div className="grid grid-cols-3 gap-2">
                          {DIFFICULTIES.map(level => (
                            <button key={level} onClick={() => updateForm('difficulty', level)}
                              className="py-2.5 rounded-xl text-[13px] font-bold border-2 transition-all"
                              style={{
                                borderColor: form.difficulty === level ? '#172a1e' : '#e1e4e0',
                                background: form.difficulty === level ? 'rgba(23,42,30,0.06)' : 'transparent',
                                color: form.difficulty === level ? '#172a1e' : '#737873',
                              }}>
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div>
                          <p className="text-[14px] font-bold theme-text-primary">Certifiable Course</p>
                          <p className="text-[12px] mt-0.5 theme-muted">Issue a digital certificate on completion</p>
                        </div>
                        <button onClick={() => updateForm('certifiable', !form.certifiable)}
                          aria-label="Certifiable course" aria-pressed={form.certifiable}
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0"
                          style={{ background: form.certifiable ? '#172a1e' : '#c3c8c1' }}>
                          <span className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                            style={{ transform: form.certifiable ? 'translateX(24px)' : 'translateX(4px)' }} />
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
              <div className="theme-action-bar mt-10 flex flex-col md:flex-row justify-between items-center gap-4 p-6 rounded-2xl border"
                style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] theme-muted">info</span>
                  <p className="text-[13px] theme-text-secondary" style={saveError ? { color: '#ba1a1a' } : undefined}>
                    {infoText}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {isEdit && (
                    <button onClick={() => navigate('/employer/courses')} disabled={isSaving}
                      className="px-5 py-3 rounded-full text-[14px] font-bold transition-all disabled:opacity-50 theme-text-secondary">
                      Cancel
                    </button>
                  )}
                  <button onClick={handleSaveDraft} disabled={isSaving}
                    className="px-6 py-3 rounded-full text-[14px] font-bold border transition-all disabled:opacity-50"
                    style={{ borderColor: '#705a49', color: '#705a49' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(112,90,73,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {isEdit ? 'Save as Draft' : 'Save Draft'}
                  </button>
                  <button onClick={handlePublish} disabled={isSaving}
                    className="px-8 py-3 rounded-full text-[15px] font-bold transition-all disabled:opacity-50"
                    style={{ background: '#172a1e', color: '#ffffff' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#2d4033'}
                    onMouseLeave={e => e.currentTarget.style.background = '#172a1e'}>
                    {isSaving ? 'Saving...' : isEdit ? 'Save & Publish' : 'Publish Course'}
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
        <footer className="theme-footer mt-8 py-8 px-8 border-t">
          <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]" style={{ color: '#172a1e' }}>cleaning_services</span>
              <span className="text-[16px] font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#172a1e' }}>CleanIQ</span>
            </div>
            <p className="text-[12px]" style={{ color: '#737873' }}>© 2025 CleanIQ. Purifying spaces, professionally.</p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Help Center'].map(link => (
                <a key={link} href="#" className="text-[12px] font-medium transition-colors" style={{ color: '#737873' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#172a1e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#737873'}>
                  {link}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
   