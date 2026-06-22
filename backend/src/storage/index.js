const MemoryUserStore = require('./memoryUserStore');
const SupabaseUserStore = require('./supabaseUserStore');
const QuizStore = require('./quizStore');
const SupabaseQuizStore = require('./supabaseQuizStore');

let userStore;
let quizStore;

const getStorageType = () => (process.env.USER_STORE || 'memory').toLowerCase();

const getUserStore = () => {
  if (userStore) {
    return userStore;
  }

  userStore = getStorageType() === 'supabase' ? new SupabaseUserStore() : new MemoryUserStore();
  return userStore;
};

const getQuizStore = () => {
  if (quizStore) {
    return quizStore;
  }

  const quizStorage = (process.env.QUIZ_STORE || process.env.USER_STORE || 'memory').toLowerCase();
  quizStore = quizStorage === 'supabase' ? new SupabaseQuizStore() : new QuizStore();
  return quizStore;
};

module.exports = { getUserStore, getQuizStore };