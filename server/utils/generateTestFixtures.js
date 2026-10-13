import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixturesDir = path.join(__dirname, '../test_fixtures');
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

async function createDocx(outputPath, textContent) {
  const templatePath = path.join(
    __dirname,
    '../node_modules/mammoth/test/test-data/single-paragraph.docx'
  );
  const templateBuf = fs.readFileSync(templatePath);
  const zip = await JSZip.loadAsync(templateBuf);

  // Split lines into XML paragraphs
  const paragraphs = textContent
    .split('\n')
    .map(
      (line) =>
        `<w:p><w:r><w:t xml:space="preserve">${line
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')}</w:t></w:r></w:p>`
    )
    .join('');

  const newDocXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${paragraphs}</w:body>
</w:document>`;

  zip.file('word/document.xml', newDocXml);
  const outBuf = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(outputPath, outBuf);
}

async function generateAllFixtures() {
  console.log('[Fixture Generator] Generating test fixtures in:', fixturesDir);

  // 1. Valid PDF (using existing authentic 310KB PDF)
  const samplePdfPath = path.join(__dirname, '../uploads/resumes/Sample_FullStack_Resume.pdf');
  const validPdfPath = path.join(fixturesDir, 'valid_resume.pdf');
  fs.copyFileSync(samplePdfPath, validPdfPath);
  console.log('  -> Created valid_resume.pdf (Size:', fs.statSync(validPdfPath).size, 'bytes)');

  // 2. Valid DOCX
  const validDocxText = `Jordan Vance
Email: jordan.vance.qa@example.com
Phone: (555) 876-5432
Summary: Machine Learning and NLP Specialist with 5+ years of experience in Python, PyTorch, TensorFlow, Scikit-learn, Docker, and AWS.
Skills: Python, Machine Learning, NLP, PyTorch, TensorFlow, Docker, AWS, Scikit-learn, FastAPI
Experience: AI Research Engineer (2019 - Present) - Built NLP matching and cosine similarity pipelines.
Education: Master of Science in Artificial Intelligence
GitHub: https://github.com/jordanvance-qa`;

  const validDocxPath = path.join(fixturesDir, 'valid_resume.docx');
  await createDocx(validDocxPath, validDocxText);
  console.log('  -> Created valid_resume.docx (Size:', fs.statSync(validDocxPath).size, 'bytes)');

  // 3. Missing Contact Info DOCX
  const missingContactText = `Morgan Taylor
Summary: Frontend Engineer with 4 years building React web applications and interactive UI components.
Skills: React, TypeScript, JavaScript, Tailwind CSS, HTML, CSS, Redux
Experience: Frontend Developer (2020 - 2024)
Education: Bachelor of Science in Information Technology`;

  const missingContactPath = path.join(fixturesDir, 'missing_contact.docx');
  await createDocx(missingContactPath, missingContactText);
  console.log('  -> Created missing_contact.docx');

  // 4. Sparse Resume DOCX
  const sparseText = `Hello applicant review only`;
  const sparsePath = path.join(fixturesDir, 'sparse_resume.docx');
  await createDocx(sparsePath, sparseText);
  console.log('  -> Created sparse_resume.docx');

  // 5. Corrupt PDF
  const corruptPdfPath = path.join(fixturesDir, 'corrupt_resume.pdf');
  fs.writeFileSync(corruptPdfPath, Buffer.from('NOT_A_VALID_PDF_HEADER_DATA_1234567890'));
  console.log('  -> Created corrupt_resume.pdf');

  // 6. Corrupt DOCX
  const corruptDocxPath = path.join(fixturesDir, 'corrupt_resume.docx');
  fs.writeFileSync(corruptDocxPath, Buffer.from('NOT_A_VALID_DOCX_HEADER_DATA_1234567890'));
  console.log('  -> Created corrupt_resume.docx');

  // 7. Unsupported File Type (.txt)
  const unsupportedPath = path.join(fixturesDir, 'unsupported_extension.txt');
  fs.writeFileSync(unsupportedPath, 'Alex Mercer\nalex@example.com\nSkills: React, Node.js');
  console.log('  -> Created unsupported_extension.txt');

  // 8. Oversized File (> 10MB)
  const oversizedPath = path.join(fixturesDir, 'oversized_resume.pdf');
  const elevenMb = 11 * 1024 * 1024;
  const oversizedBuf = Buffer.alloc(elevenMb, 0x20); // 11MB of spaces
  fs.writeFileSync(oversizedPath, oversizedBuf);
  console.log('  -> Created oversized_resume.pdf (Size:', fs.statSync(oversizedPath).size, 'bytes)');

  console.log('[Fixture Generator] All test fixtures ready!\n');
}

generateAllFixtures().catch(console.error);
