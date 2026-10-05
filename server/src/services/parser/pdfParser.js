import fs from 'fs';
import pdfParse from 'pdf-parse';

/**
 * Extracts raw plain text from a PDF file
 * @param {string} filePath - Absolute path to PDF file
 * @returns {Promise<string>} Cleaned plain text
 */
export const parsePdf = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || '';
  } catch (error) {
    console.error(`[PDF Parser] Error reading ${filePath}:`, error.message);
    throw new Error(`Failed to parse PDF document: ${error.message}`);
  }
};
