const crypto = require('crypto');
const supabase = require('../config/supabase');

// The private Supabase Storage bucket created by supabase_lesson_files.sql
const BUCKET = 'course-files';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

// File types admins may upload (must match the bucket's allowed types)
const ALLOWED_TYPES = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/webp': '.webp',
};

// Every stored file lives at lessons/<random id>/<safe file name>
const FILE_PATH_PATTERN = /^lessons\/[0-9a-f-]{36}\/[A-Za-z0-9._-]{1,120}$/;
const isLessonFilePath = (value) => typeof value === 'string' && FILE_PATH_PATTERN.test(value);

const isAllowedType = (mimeType) => Object.prototype.hasOwnProperty.call(ALLOWED_TYPES, mimeType);

// Browsers send file names in UTF-8, but the upload library reads them as Latin-1,
// which turns "Éco" into "Ã‰co". This undoes that when needed.
const fixFileNameEncoding = (name) => {
    const decoded = Buffer.from(name, 'latin1').toString('utf8');
    return decoded.includes('\uFFFD') ? name : decoded;
};

// "The Looseners (v2).pdf" -> "The-Looseners-v2.pdf" (safe to use in a storage path)
const toStorageName = (originalName, mimeType) => {
    const extension = (originalName.match(/\.[A-Za-z0-9]{1,5}$/)?.[0] || ALLOWED_TYPES[mimeType] || '').toLowerCase();
    const base = originalName
        .slice(0, originalName.length - (originalName.match(/\.[A-Za-z0-9]{1,5}$/)?.[0].length || 0))
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')      // remove accents (é -> e)
        .replace(/[^A-Za-z0-9._-]+/g, '-')    // anything else becomes a dash
        .replace(/-+/g, '-')
        .replace(/^[-.]+|[-.]+$/g, '')
        .slice(0, 100);
    return `${base || 'file'}${extension}`;
};

const uploadLessonFile = async ({ buffer, originalName, mimeType }) => {
    const fileName = fixFileNameEncoding(originalName).trim().slice(0, 200) || 'file';
    const filePath = `lessons/${crypto.randomUUID()}/${toStorageName(fileName, mimeType)}`;

    const { error } = await supabase.storage.from(BUCKET).upload(filePath, buffer, {
        contentType: mimeType,
        upsert: false,
    });
    if (error) throw error;

    return { filePath, fileName, fileSize: buffer.length, fileType: mimeType };
};

// A temporary link (valid for 1 hour) to open a private file
const createFileUrl = async (filePath, expiresInSeconds = 60 * 60) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, expiresInSeconds);
    if (error) throw error;
    return data.signedUrl;
};

// Deletes files that are no longer used. Never throws: a leftover file is better than a failed save.
const removeFiles = async (filePaths) => {
    const paths = [...new Set(filePaths.filter(isLessonFilePath))];
    if (paths.length === 0) return;
    try {
        const { error } = await supabase.storage.from(BUCKET).remove(paths);
        if (error) console.error('Could not remove course files:', error.message);
    } catch (error) {
        console.error('Could not remove course files:', error.message);
    }
};

module.exports = {
    MAX_FILE_SIZE,
    isAllowedType,
    isLessonFilePath,
    uploadLessonFile,
    createFileUrl,
    removeFiles,
};frontend/src/components/EmployerSidebar.tsx 