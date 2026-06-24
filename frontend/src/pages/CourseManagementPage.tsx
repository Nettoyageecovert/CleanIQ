import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployerSidebar from '../components/EmployerSidebar';
import { courseApi, fetchCourseCategories } from '../api/courses';
import { TRAINING_CATEGORIES, getCategoryIcon } from '../constants/trainingCategories';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'document';
  meta: string;
}

interface Module {
  id: string;
  title: string;
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

const CATEGORIES = TRAINING_CATEGORIES;

const createLesson = (type: 'video' | 'document'): Lesson => ({
  id: crypto.randomUUID(),
  title: '',
  type,
  meta: type === 'video' ? '0:00 mins' : '0 MB',
});

const createModule = (): Module => ({
  id: crypto.randomUUID(),
  title: '',
  expanded: true,
  lessons: [],
});

export default function CourseManagementPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<CourseForm>({
    title: '',
    description: '',
    category: CATEGORIES[0],
    difficulty: 'Intermediate',
    certifiable: true,
  });

  const [modules, setModules] = useState<Module[]>([createModule()]);
  const [categories, setCategories] = useState<string[]>([...CATEGORIES]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseCategories()
      .then(setCategories)
      .catch(() => setCategories([...CATEGORIES]));
  }, []);

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

    const iconStyle = getCategoryIcon(form.category);

    setIsSaving(true);
    setSaveError('');
    try {
      await courseApi.createCourse({
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
        modules: modules.map(({ title, lessons }) => ({
          title,
          lessons: lessons.map(({ title: lessonTitle, type, meta }) => ({
            title: lessonTitle,
            type,
            meta,
          })),
        })),
      });
      navigate('/employer/dashboard');
    } catch {
      setSaveError('Unable to save course. Please try again.');
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

  return (
    <div className="theme-page min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <EmployerSidebar />

      <div className="lg:ml-72 flex flex-col min-h-screen">
        <header className="theme-header-bar h-20 sticky top-0 z-40 flex items-center justify-between px-8 border-b">
          <h1 className="text-[22px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
            CleanIQ Admin
          </h1>
          <div className="flex items-center gap-3">
            {['notifications', 'settings'].map(icon => (
              <button key={icon} className="w-10 h-10 flex items-center justify-center rounded-full transition-colors theme-text-secondary"
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
              <span className="text-[12px] font-bold uppercase tracking-wider theme-text-primary">Course Management</span>
            </nav>
            <h2 className="text-[32px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Create New Course
            </h2>
            <p className="text-[15px] mt-1 theme-text-secondary">
              Design an immersive learning experience. Fill in the details, structure your curriculum, and configure settings.
            </p>
          </div>
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
                          <button key={icon} className="p-1.5 rounded-lg transition-colors theme-text-secondary"
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
                        <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-[20px] cursor-grab" style={{ color: '#737873' }}>
                            drag_indicator
                          </span>
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-widest block" style={{ color: '#172a1e' }}>
                              Module {String(mIndex + 1).padStart(2, '0')}
                            </span>
                            <input type="text" value={module.title}
                              onChange={e => updateModuleTitle(module.id, e.target.value)}
                              placeholder="Module title..."
                              className="text-[16px] font-bold bg-transparent border-none outline-none"
                              style={{ color: '#1b1c1a' }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => removeModule(module.id)}
                            className="p-1.5 rounded-lg transition-colors" style={{ color: '#737873' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#ba1a1a'; e.currentTarget.style.background = '#ffdad6'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#737873'; e.currentTarget.style.background = 'transparent'; }}>
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                          <button onClick={() => toggleModule(module.id)}
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
                          {module.lessons.map(lesson => (
                            <div key={lesson.id}
                              className="theme-lesson-row flex items-center gap-3 px-4 py-3 rounded-xl border group transition-all"
                              onMouseEnter={e => e.currentTarget.style.borderColor = '#b6ccba'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                              <span className="material-symbols-outlined text-[18px] cursor-grab" style={{ color: '#c3c8c1' }}>
                                drag_handle
                              </span>
                              <span className="material-symbols-outlined text-[20px]" style={{ color: '#705a49' }}>
                                {lesson.type === 'video' ? 'video_library' : 'description'}
                              </span>
                              <input type="text" value={lesson.title}
                                onChange={e => updateLessonTitle(module.id, lesson.id, e.target.value)}
                                placeholder={lesson.type === 'video' ? 'Lesson title...' : 'Document title...'}
                                className="flex-1 bg-transparent border-none outline-none text-[14px] theme-text-primary" />
                              <span className="text-[12px] font-bold theme-muted">{lesson.meta}</span>
                              <button onClick={() => removeLesson(module.id, lesson.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all"
                                style={{ color: '#737873' }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#ba1a1a'; e.currentTarget.style.background = '#ffdad6'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#737873'; e.currentTarget.style.background = 'transparent'; }}>
                                <span className="material-symbols-outlined text-[18px]">close</span>
                              </button>
                            </div>
                          ))}
                          <div className="flex gap-3">
                            {(['video', 'document'] as const).map(type => (
                              <button key={type} onClick={() => addLesson(module.id, type)}
                                className="theme-dropzone flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[13px] font-medium">
                                <span className="material-symbols-outlined text-[18px]">
                                  {type === 'video' ? 'video_library' : 'description'}
                                </span>
                                Add {type === 'video' ? 'Video' : 'Document'}
                              </button>
                            ))}
                          </div>
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
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold uppercase tracking-wider mb-3 theme-text-secondary">Difficulty Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Beginner', 'Intermediate', 'Advanced'] as const).map(level => (
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
              <p className="text-[13px] theme-text-secondary">
                {saveError || 'Courses are saved to your training library when you publish or save a draft.'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleSaveDraft} disabled={isSaving}
                className="px-6 py-3 rounded-full text-[14px] font-bold border transition-all disabled:opacity-50"
                style={{ borderColor: '#705a49', color: '#705a49' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(112,90,73,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                Save Draft
              </button>
              <button onClick={handlePublish} disabled={isSaving}
                className="px-8 py-3 rounded-full text-[15px] font-bold transition-all disabled:opacity-50"
                style={{ background: '#172a1e', color: '#ffffff' }}
                onMouseEnter={e => e.currentTarget.style.background = '#2d4033'}
                onMouseLeave={e => e.currentTarget.style.background = '#172a1e'}>
                {isSaving ? 'Saving...' : 'Publish Course'}
              </button>
            </div>
          </div>
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