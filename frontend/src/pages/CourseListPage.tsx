import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EmployerSidebar from '../components/EmployerSidebar';
import {
  addCourseCategory,
  courseApi,
  fetchCategoryItems,
  fetchCourseRows,
  getErrorMessage,
  isDraftCourse,
  removeCourseCategory,
} from '../api/courses';
import type { CourseCategory, CourseRow } from '../api/courses';

type StatusFilter = 'all' | 'published' | 'draft';

// Icons the admin can pick for a new category (Material Symbols names + a matching soft color)
const CATEGORY_ICON_CHOICES = [
  { icon: 'school', color: '#dae8be' },
  { icon: 'health_and_safety', color: '#d2e8d6' },
  { icon: 'cleaning_services', color: '#b6ccba' },
  { icon: 'science', color: '#dae8be' },
  { icon: 'eco', color: '#b6ccba' },
  { icon: 'home_health', color: '#f8dac5' },
  { icon: 'workspace_premium', color: '#efeeea' },
  { icon: 'groups', color: '#f8dac5' },
];

interface ConfirmState {
  kind: 'course' | 'category';
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}

const cardStyle = { boxShadow: '0 4px 20px rgba(45,64,51,0.05)', borderColor: 'var(--border-subtle)' };

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

// Thumbnails saved as "blob:" links only worked in the browser tab that uploaded them
const usableThumbnail = (url: string | null) => (url && !url.startsWith('blob:') ? url : null);

export default function CourseListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<string>(
    (location.state as { notice?: string } | null)?.notice ?? ''
  );

  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [categoriesReady, setCategoriesReady] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState(CATEGORY_ICON_CHOICES[0]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryMessage, setCategoryMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const loadCourses = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      setCourses(await fetchCourseRows());
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Unable to load courses. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  // First load of the page
  useEffect(() => {
    fetchCourseRows()
      .then(setCourses)
      .catch(error => setLoadError(getErrorMessage(error, 'Unable to load courses. Please try again.')))
      .finally(() => setIsLoading(false));
    fetchCategoryItems()
      .then(items => {
        setCategories(items);
        setCategoriesReady(items.length > 0);
      })
      .catch(() => setCategoriesReady(false));
  }, []);

  // Clear the "course saved" message from the browser history so it doesn't show again on refresh
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  const counts = useMemo(() => {
    const drafts = courses.filter(isDraftCourse).length;
    return { all: courses.length, published: courses.length - drafts, draft: drafts };
  }, [courses]);

  const coursesPerCategory = useMemo(() => {
    const map = new Map<string, number>();
    courses.forEach(course => {
      if (course.category) map.set(course.category, (map.get(course.category) ?? 0) + 1);
    });
    return map;
  }, [courses]);

  const visibleCourses = useMemo(() => {
    const term = search.trim().toLowerCase();
    return courses.filter(course => {
      const draft = isDraftCourse(course);
      if (filter === 'published' && draft) return false;
      if (filter === 'draft' && !draft) return false;
      if (!term) return true;
      return [course.title, course.category ?? '', course.difficulty ?? '']
        .some(text => text.toLowerCase().includes(term));
    });
  }, [courses, filter, search]);

  // ─── Courses ───────────────────────────────────────────────────────────────

  const askDeleteCourse = (course: CourseRow) => {
    setNotice('');
    setConfirm({
      kind: 'course',
      title: 'Delete this course?',
      message: `"${course.title}" will be permanently deleted, along with its modules, lessons and every employee's progress on it. This cannot be undone.`,
      confirmLabel: 'Delete Course',
      onConfirm: async () => {
        await courseApi.deleteCourse(course.id);
        setCourses(prev => prev.filter(c => c.id !== course.id));
        setNotice(`"${course.title}" was deleted.`);
      },
    });
  };

  // ─── Categories ────────────────────────────────────────────────────────────

  const handleAddCategory = async () => {
    const name = newCategoryName.trim().replace(/\s+/g, ' ');
    if (!name) {
      setCategoryMessage({ type: 'error', text: 'Type a category name first.' });
      return;
    }
    setIsAddingCategory(true);
    setCategoryMessage(null);
    try {
      const created = await addCourseCategory({ name, icon: newCategoryIcon.icon, color: newCategoryIcon.color });
      setCategories(prev => [...prev, created]);
      setNewCategoryName('');
      setCategoryMessage({ type: 'success', text: `"${created.name}" was added.` });
    } catch (error) {
      setCategoryMessage({ type: 'error', text: getErrorMessage(error, 'Unable to add category. Please try again.') });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const askRemoveCategory = (category: CourseCategory) => {
    setCategoryMessage(null);
    const usedBy = coursesPerCategory.get(category.name) ?? 0;
    if (usedBy > 0) {
      setCategoryMessage({
        type: 'error',
        text: `${usedBy} course${usedBy === 1 ? '' : 's'} use${usedBy === 1 ? 's' : ''} "${category.name}". Move ${usedBy === 1 ? 'it' : 'them'} to another category first.`,
      });
      return;
    }
    setConfirm({
      kind: 'category',
      title: 'Remove this category?',
      message: `"${category.name}" will no longer be available when creating or editing courses.`,
      confirmLabel: 'Remove Category',
      onConfirm: async () => {
        await removeCourseCategory(category.id);
        setCategories(prev => prev.filter(c => c.id !== category.id));
        setCategoryMessage({ type: 'success', text: `"${category.name}" was removed.` });
      },
    });
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setIsConfirming(true);
    try {
      await confirm.onConfirm();
      setConfirm(null);
    } catch (error) {
      const text = getErrorMessage(error, 'Something went wrong. Please try again.');
      setConfirm(null);
      if (confirm.kind === 'category') {
        setCategoryMessage({ type: 'error', text });
      } else {
        setNotice(text);
      }
    } finally {
      setIsConfirming(false);
    }
  };

  // ─── UI ────────────────────────────────────────────────────────────────────

  const filterTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Drafts' },
  ];

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
              <button key={icon} aria-label={icon}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors theme-text-secondary"
                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-nav-employer)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span className="material-symbols-outlined">{icon}</span>
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 px-8 py-10 max-w-[1100px] mx-auto w-full">
          <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <nav className="flex items-center gap-1 mb-2">
                <span className="text-[12px] font-bold uppercase tracking-wider theme-muted">Admin Console</span>
                <span className="material-symbols-outlined text-[14px] theme-muted">chevron_right</span>
                <span className="text-[12px] font-bold uppercase tracking-wider theme-text-primary">Course Management</span>
              </nav>
              <h2 className="text-[32px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Course Management
              </h2>
              <p className="text-[15px] mt-1 theme-text-secondary">
                View, edit and remove your courses, and manage the categories they belong to.
              </p>
            </div>
            <button onClick={() => navigate('/employer/courses/new')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[15px] font-bold transition-all shrink-0"
              style={{ background: '#172a1e', color: '#ffffff' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2d4033'}
              onMouseLeave={e => e.currentTarget.style.background = '#172a1e'}>
              <span className="material-symbols-outlined text-[20px]">add</span>
              Create New Course
            </button>
          </div>

          {notice && (
            <div className="theme-tip mb-6 p-4 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">info</span>
                <p className="text-[14px]">{notice}</p>
              </div>
              <button aria-label="Dismiss message" onClick={() => setNotice('')}
                className="p-1 rounded-lg">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ─── All courses ─── */}
            <section className="lg:col-span-8 theme-section-card rounded-2xl p-6 border" style={cardStyle}>
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-[22px]" style={{ color: '#705a49' }}>library_books</span>
                <h3 className="text-[22px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  All Courses
                </h3>
              </div>

              <div className="flex flex-col md:flex-row gap-3 mb-5">
                <div className="flex gap-2">
                  {filterTabs.map(tab => (
                    <button key={tab.key} onClick={() => setFilter(tab.key)}
                      className="px-4 py-2 rounded-full text-[13px] font-bold border-2 transition-all whitespace-nowrap"
                      style={{
                        borderColor: filter === tab.key ? '#172a1e' : '#e1e4e0',
                        background: filter === tab.key ? 'rgba(23,42,30,0.06)' : 'transparent',
                        color: filter === tab.key ? '#172a1e' : '#737873',
                      }}>
                      {tab.label} ({counts[tab.key]})
                    </button>
                  ))}
                </div>
                <div className="relative flex-1">
                  <span className="material-symbols-outlined text-[18px] absolute left-3 top-1/2 -translate-y-1/2 theme-muted">search</span>
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by title, category or level..."
                    aria-label="Search courses"
                    className="theme-input w-full pl-10 pr-4 py-2 rounded-full text-[14px] border outline-none" />
                </div>
              </div>

              {isLoading && (
                <p className="text-[14px] py-10 text-center theme-muted">Loading courses...</p>
              )}

              {!isLoading && loadError && (
                <div className="py-10 flex flex-col items-center gap-3">
                  <p className="text-[14px]" style={{ color: '#ba1a1a' }}>{loadError}</p>
                  <button onClick={loadCourses}
                    className="px-5 py-2 rounded-full text-[13px] font-bold border"
                    style={{ borderColor: '#172a1e', color: '#172a1e' }}>
                    Try Again
                  </button>
                </div>
              )}

              {!isLoading && !loadError && visibleCourses.length === 0 && (
                <div className="theme-dropzone py-12 rounded-2xl flex flex-col items-center justify-center gap-2 text-center px-6">
                  <span className="material-symbols-outlined text-[36px]">menu_book</span>
                  <p className="text-[14px] font-medium">
                    {courses.length === 0
                      ? 'No courses yet. Click "Create New Course" to add your first one.'
                      : 'No courses match this filter.'}
                  </p>
                </div>
              )}

              {!isLoading && !loadError && visibleCourses.length > 0 && (
                <ul className="space-y-3">
                  {visibleCourses.map(course => {
                    const draft = isDraftCourse(course);
                    const thumbnail = usableThumbnail(course.thumbnail_url);
                    return (
                      <li key={course.id}
                        className="theme-lesson-row flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border">
                        <div className="w-full sm:w-24 h-24 sm:h-16 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
                          style={{ background: course.color || '#efeeea' }}>
                          {thumbnail ? (
                            <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-[28px]" style={{ color: '#172a1e' }}>
                              {course.icon || 'menu_book'}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[16px] font-bold truncate theme-text-primary">{course.title}</p>
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                              style={draft
                                ? { background: '#f8dac5', color: '#705a49' }
                                : { background: '#d2e8d6', color: '#172a1e' }}>
                              {draft ? 'Draft' : 'Published'}
                            </span>
                          </div>
                          <p className="text-[13px] mt-1 theme-muted">
                            {[course.category || 'Uncategorized', course.difficulty, formatDate(course.created_at)]
                              .filter(Boolean).join(' · ')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => navigate(`/employer/courses/${course.id}/edit`)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold border transition-all"
                            style={{ borderColor: '#172a1e', color: '#172a1e' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(23,42,30,0.06)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                            Edit
                          </button>
                          <button onClick={() => askDeleteCourse(course)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold border transition-all"
                            style={{ borderColor: '#ba1a1a', color: '#ba1a1a' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#ffdad6'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Delete
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* ─── Categories ─── */}
            <section className="lg:col-span-4 theme-section-card rounded-2xl p-6 border self-start" style={cardStyle}>
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-[22px]" style={{ color: '#705a49' }}>category</span>
                <h3 className="text-[20px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Categories
                </h3>
              </div>

              {!categoriesReady ? (
                <p className="text-[13px] theme-text-secondary">
                  Categories can't be managed yet. The categories table hasn't been set up in the database.
                </p>
              ) : (
                <>
                  <ul className="space-y-2 mb-5">
                    {categories.map(category => {
                      const usedBy = coursesPerCategory.get(category.name) ?? 0;
                      return (
                        <li key={category.id} className="flex items-center gap-3 px-3 py-2 rounded-xl theme-panel">
                          <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: category.color }}>
                            <span className="material-symbols-outlined text-[18px]" style={{ color: '#172a1e' }}>{category.icon}</span>
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold truncate theme-text-primary">{category.name}</p>
                            <p className="text-[11px] theme-muted">{usedBy} course{usedBy === 1 ? '' : 's'}</p>
                          </div>
                          <button onClick={() => askRemoveCategory(category)}
                            aria-label={`Remove ${category.name}`} title={`Remove ${category.name}`}
                            className="p-1.5 rounded-lg transition-colors" style={{ color: '#737873' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#ba1a1a'; e.currentTarget.style.background = '#ffdad6'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#737873'; e.currentTarget.style.background = 'transparent'; }}>
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <label htmlFor="new-category" className="block text-[13px] font-bold uppercase tracking-wider mb-2 theme-text-secondary">
                      Add a Category
                    </label>
                    <input id="new-category" type="text" value={newCategoryName} maxLength={50}
                      onChange={e => setNewCategoryName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); }}
                      placeholder="e.g., Floor Care"
                      className="theme-input w-full px-4 py-2.5 rounded-xl text-[14px] border outline-none mb-3" />

                    <p className="text-[12px] font-bold mb-2 theme-muted">Icon</p>
                    <div className="grid grid-cols-8 gap-1.5 mb-4">
                      {CATEGORY_ICON_CHOICES.map(choice => {
                        const selected = choice.icon === newCategoryIcon.icon;
                        return (
                          <button key={choice.icon} type="button" onClick={() => setNewCategoryIcon(choice)}
                            aria-label={`Icon ${choice.icon.replace(/_/g, ' ')}`} aria-pressed={selected}
                            className="aspect-square rounded-lg flex items-center justify-center border-2 transition-all"
                            style={{ background: choice.color, borderColor: selected ? '#172a1e' : 'transparent' }}>
                            <span className="material-symbols-outlined text-[16px]" style={{ color: '#172a1e' }}>{choice.icon}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button onClick={handleAddCategory} disabled={isAddingCategory}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-[14px] font-bold transition-all disabled:opacity-50"
                      style={{ background: '#172a1e', color: '#ffffff' }}>
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      {isAddingCategory ? 'Adding...' : 'Add Category'}
                    </button>
                  </div>
                </>
              )}

              {categoryMessage && (
                <p role="status" className="text-[13px] mt-4 p-3 rounded-xl"
                  style={categoryMessage.type === 'error'
                    ? { background: '#ffdad6', color: '#93000a' }
                    : { background: '#d2e8d6', color: '#172a1e' }}>
                  {categoryMessage.text}
                </p>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* ─── Confirmation pop-up ─── */}
      {confirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => { if (!isConfirming) setConfirm(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="confirm-title"
            className="theme-section-card w-full max-w-md rounded-2xl p-6 border" style={cardStyle}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#ffdad6' }}>
                <span className="material-symbols-outlined text-[22px]" style={{ color: '#ba1a1a' }}>warning</span>
              </span>
              <h3 id="confirm-title" className="text-[20px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {confirm.title}
              </h3>
            </div>
            <p className="text-[14px] leading-relaxed mb-6 theme-text-secondary">{confirm.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirm(null)} disabled={isConfirming}
                className="px-5 py-2.5 rounded-full text-[14px] font-bold border disabled:opacity-50"
                style={{ borderColor: '#737873', color: '#434843' }}>
                Cancel
              </button>
              <button onClick={runConfirm} disabled={isConfirming}
                className="px-5 py-2.5 rounded-full text-[14px] font-bold disabled:opacity-50"
                style={{ background: '#ba1a1a', color: '#ffffff' }}>
                {isConfirming ? 'Working...' : confirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}