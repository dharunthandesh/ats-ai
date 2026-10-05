import path from 'path';
import { parsePdf } from './pdfParser.js';
import { parseDocx } from './docxParser.js';
import { extractResumeEntities } from './entityExtractor.js';

/**
 * Unified resume parsing entrypoint
 * @param {object} file - Express Multer file object
 * @returns {Promise<object>} Structured parsed resume candidate payload
 */
export const processResumeFile = async (file) => {
  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();
  let rawText = '';

  if (ext === '.pdf' || file.mimetype === 'application/pdf') {
    rawText = await parsePdf(filePath);
  } else if (
    ext === '.docx' ||
    ext === '.doc' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.mimetype === 'application/msword'
  ) {
    rawText = await parseDocx(filePath);
  } else {
    throw new Error(`Unsupported document extension: ${ext}`);
  }

  // Extract structured entities
  const extracted = extractResumeEntities(rawText, file.originalname);

  return {
    ...extracted,
    resumeOriginalName: file.originalname,
    resumeFilePath: file.path,
    resumeMimeType: file.mimetype,
    resumeRawText: rawText,
  };
};
