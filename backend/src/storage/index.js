const MemoryUserStore = require('./memoryUserStore');
const SupabaseUserStore = require('./supabaseUserStore');
const QuizStore = require('./quizStore');

let userStore;
let quizStore;

const getUserStore = () => {
  if (userStore) {
    return userStore;
  }

  const storageType = (process.env.USER_STORE || 'memory').toLowerCase();
  userStore = storageType === 'supabase' ? new SupabaseUserStore() : new MemoryUserStore();
  return userStore;
};

const getQuizStore = () => {
  if (quizStore) {
    return quizStore;
  }

  quizStore = new QuizStore();
  return quizStore;
};

module.exports = { getUserStore, getQuizStore };