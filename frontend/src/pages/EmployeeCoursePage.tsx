import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  fetchCourseDetails,
  formatFileSize,
  getErrorMessage,
  isDraftCourse,
  openLessonFile,
} from '../api/courses';
import type { Course } from '../api/courses';
import { getCategoryIcon } from '../constants/trainingCategories';

const cardStyle = { boxShadow: '0 4px 20px rgba(45,64,51,0.05)', borderColor: 'var(--border-subtle)' };

export default function EmployeeCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [openError, setOpenError] = useState('');
  const [openingPath, setOpeningPath] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    fetchCourseDetails(courseId)
      .then(data => {
        if (cancelled) return;
        if (isDraftCourse(data)) {
          setLoadError("This course isn't available yet.");
        } else {
          setCourse(data);
        }
      })
      .catch(error => {
        if (cancelled) return;
        const status = (error as { response?: { status?: number } }).response?.status;
        setLoadError(status === 404
          ? 'This course could not be found. It may have been removed.'
          : getErrorMessage(error, 'Unable to load this course. Please try again.'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [courseId]);

  const handleOpen = async (filePath: string) => {
    setOpenError('');
    setOpeningPath(filePath);
    try {
      await openLessonFile(filePath);
    } catch (error) {
      setOpenError(getErrorMessage(error, 'Unable to open this document. Please try again.'));
    } finally {
      setOpeningPath(null);
    }
  };

  const modules = course?.modules ?? [];
  const lessonCount = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const iconStyle = course ? getCategoryIcon(course.category) : null;

  return (
    <div className="theme-page min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <Sidebar />

      <main className="lg:ml-72 min-h-screen flex flex-col">
        <header className="theme-header-bar h-20 flex items-center justify-between px-8 sticky top-0 z-40 border-b">
          <button onClick={() => navigate('/employee/courses')}
            className="flex items-center gap-2 text-[15px] font-bold theme-text-primary">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            My Courses
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[14px] font-bold theme-text-primary">{user?.fullName}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider theme-muted">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: '#172a1e' }}>
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 px-8 py-10 max-w-[900px] mx-auto w-full">
          {isLoading && (
            <p className="text-[15px] py-16 text-center theme-muted">Loading course...</p>
          )}

          {!isLoading && loadError && (
            <div className="theme-section-card rounded-2xl p-10 border flex flex-col items-center gap-4 text-center" style={cardStyle}>
              <span className="material-symbols-outlined text-[36px]" style={{ color: '#705a49' }}>info</span>
              <p className="text-[15px] theme-text-primary">{loadError}</p>
              <button onClick={() => navigate('/employee/courses')}
                className="px-6 py-3 rounded-full text-[14px] font-bold"
                style={{ background: '#172a1e', color: '#ffffff' }}>
                Back to My Courses
              </button>
            </div>
          )}

          {!isLoading && course && (
            <>
              {/* Course header */}
              <section className="rounded-[24px] p-8 mb-8 flex flex-col md:flex-row gap-6 md:items-center"
                style={{ background: 'linear-gradient(135deg, #172a1e 0%, #2d4033 60%, #344022 100%)' }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: course.color || iconStyle?.color }}>
                  <span className="material-symbols-outlined text-[40px]" style={{ color: '#172a1e' }}>
                    {course.icon || iconStyle?.icon}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: '#dae8be' }}>
                    {[course.category, course.difficulty].filter(Boolean).join(' · ')}
                  </p>
                  <h1 className="text-[30px] font-bold leading-tight text-white mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {course.title}
                  </h1>
                  <p className="text-[13px]" style={{ color: 'rgba(182,204,186,0.85)' }}>
                    {modules.length} module{modules.length === 1 ? '' : 's'} · {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
                  </p>
                </div>
              </section>

              {course.description && (
                <section className="theme-section-card rounded-2xl p-6 border mb-8" style={cardStyle}>
                  <h2 className="text-[18px] font-bold mb-3 theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    About this course
                  </h2>
                  <p className="text-[15px] leading-relaxed whitespace-pre-line theme-text-secondary">{course.description}</p>
                </section>
              )}

              {openError && (
                <p role="alert" className="text-[14px] mb-6 p-4 rounded-xl" style={{ background: '#ffdad6', color: '#93000a' }}>
                  {openError}
                </p>
              )}

              {/* Modules */}
              <div className="space-y-5">
                {modules.length === 0 && (
                  <p className="text-[14px] text-center py-10 theme-muted">This course has no lessons yet.</p>
                )}
                {modules.map((module, mIndex) => (
                  <section key={module.id ?? mIndex} className="theme-section-card rounded-2xl border overflow-hidden" style={cardStyle}>
                    <div className="px-6 py-5" style={{ background: 'rgba(23,42,30,0.04)' }}>
                      <span className="text-[11px] font-bold uppercase tracking-widest block mb-1" style={{ color: '#705a49' }}>
                        Module {String(mIndex + 1).padStart(2, '0')}
                      </span>
                      <h2 className="text-[19px] font-bold theme-text-primary" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        {module.title}
                      </h2>
                      {module.description && (
                        <p className="text-[14px] leading-relaxed mt-2 whitespace-pre-line theme-text-secondary">{module.description}</p>
                      )}
                    </div>

                    <ul className="p-4 space-y-2">
                      {module.lessons.length === 0 && (
                        <li className="text-[13px] px-2 py-2 theme-muted">No lessons in this module yet.</li>
                      )}
                      {module.lessons.map((lesson, lIndex) => (
                        <li key={lesson.id ?? lIndex}
                          className="theme-lesson-row flex items-center gap-3 px-4 py-3 rounded-xl border">
                          <span className="material-symbols-outlined text-[22px] shrink-0" style={{ color: '#705a49' }}>
                            {lesson.type === 'video' ? 'video_library' : 'description'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-medium theme-text-primary">{lesson.title}</p>
                            {lesson.fileName && (
                              <p className="text-[12px] truncate theme-muted">
                                {lesson.fileName}{lesson.fileSize ? ` · ${formatFileSize(lesson.fileSize)}` : ''}
                              </p>
                            )}
                          </div>
                          {lesson.filePath ? (
                            <button onClick={() => handleOpen(lesson.filePath as string)}
                              disabled={openingPath === lesson.filePath}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold shrink-0 disabled:opacity-60"
                              style={{ background: '#172a1e', color: '#ffffff' }}>
                              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                              {openingPath === lesson.filePath ? 'Opening...' : 'Open'}
                            </button>
                          ) : (
                            <span className="text-[12px] shrink-0 theme-muted">Coming soon</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}