import mammoth from 'mammoth';

/**
 * Extracts raw plain text from a DOCX or DOC file
 * @param {string} filePath - Absolute path to document
 * @returns {Promise<string>} Plain text representation
 */
export const parseDocx = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (error) {
    console.error(`[DOCX Parser] Error reading ${filePath}:`, error.message);
    throw new Error(`Failed to parse DOCX document: ${error.message}`);
  }
};
