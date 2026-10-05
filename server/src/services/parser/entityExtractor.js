import { ALL_SKILLS, SKILL_ALIASES } from '../../constants/skillTaxonomy.js';

/**
 * Extracts structured entities from unstructured resume text
 * @param {string} rawText - Unstructured text from PDF/DOCX
 * @param {string} originalFileName - Original file name as fallback
 * @returns {object} Structured candidate profile
 */
export const extractResumeEntities = (rawText = '', originalFileName = '') => {
  const normalizedText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Email extraction
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  const emailMatch = normalizedText.match(emailRegex);
  const email = emailMatch ? emailMatch[0].toLowerCase() : '';

  // 2. Phone extraction (international or domestic formats)
  const phoneRegex = /(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,14})/;
  const phoneMatch = normalizedText.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  // 3. Name extraction heuristic
  // Take top lines, filter out email/phone, headers like "RESUME", "CURRICULUM VITAE"
  let candidateName = '';
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    if (
      line.length > 2 &&
      line.length < 50 &&
      !line.includes('@') &&
      !line.match(/\d{3}/) &&
      !/resume|curriculum|vitae|profile|page|contact/i.test(line)
    ) {
      // Remove any weird leading symbols
      candidateName = line.replace(/[^a-zA-Z\s.-]/g, '').trim();
      if (candidateName.split(' ').length >= 2) {
        break;
      }
    }
  }

  // Fallback name from filename if not found in text
  if (!candidateName) {
    const cleanFilename = originalFileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]/g, ' ')
      .replace(/resume|cv|profile/gi, '')
      .trim();
    candidateName = cleanFilename || 'Applicant';
  }

  // 4. Skills extraction against comprehensive taxonomy
  const foundSkills = new Set();
  const lowerText = ` ${normalizedText.toLowerCase()} `;

  // Check aliases first
  for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
    const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s,;.:/()])${escapedAlias}(?:[\\s,;.:/()]|$)`, 'i');
    if (regex.test(lowerText)) {
      foundSkills.add(canonical);
    }
  }

  // Check canonical skills
  for (const skill of ALL_SKILLS) {
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s,;.:/()])${escapedSkill}(?:[\\s,;.:/()]|$)`, 'i');
    if (regex.test(lowerText)) {
      foundSkills.add(skill);
    }
  }

  // 5. Experience calculation heuristic
  // Look for date patterns e.g. "2018 - 2022", "Jan 2019 - Present", "2020 - Current"
  const dateRangeRegex = /(?:(19\d{2}|20\d{2})|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[\w\s,]*[-–to]+[\w\s,]*(?:(19\d{2}|20\d{2})|present|current|now)/gi;
  const matches = [...normalizedText.matchAll(dateRangeRegex)];
  let estimatedYears = 0;

  // Search for explicit experience mentions like "5+ years of experience"
  const expMentionRegex = /(\d{1,2})\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience/i;
  const expMentionMatch = normalizedText.match(expMentionRegex);

  if (expMentionMatch && expMentionMatch[1]) {
    estimatedYears = parseFloat(expMentionMatch[1]);
  } else if (matches.length > 0) {
    // Estimate by finding min year and max year
    const yearMatches = [...normalizedText.matchAll(/\b(199\d|20[0-2]\d)\b/g)].map((m) =>
      parseInt(m[1], 10)
    );
    if (yearMatches.length >= 2) {
      const minYear = Math.min(...yearMatches);
      const currentYear = new Date().getFullYear();
      const maxYear = Math.min(Math.max(...yearMatches), currentYear);
      estimatedYears = Math.min(Math.max(maxYear - minYear, 1), 30);
    } else {
      estimatedYears = Math.max(matches.length * 1.5, 1);
    }
  } else {
    estimatedYears = 2; // Default reasonable baseline
  }

  // 6. Education detection
  const education = [];
  let highestDegree = 'Bachelor';

  const degreeKeywords = [
    { pattern: /\b(ph\.?d|doctorate)\b/i, degree: 'Ph.D.' },
    { pattern: /\b(master'?s?|m\.?s\.?|m\.?tech|mba|mca)\b/i, degree: 'Master' },
    { pattern: /\b(bachelor'?s?|b\.?s\.?|b\.?tech|b\.?e\.?|bca|bba)\b/i, degree: 'Bachelor' },
    { pattern: /\b(diploma|associate'?s?)\b/i, degree: 'Associate / Diploma' },
  ];

  for (const { pattern, degree } of degreeKeywords) {
    if (pattern.test(normalizedText)) {
      highestDegree = degree;
      education.push({
        institution: 'University / Institute',
        degree,
        fieldOfStudy: 'Computer Science / Engineering',
        gradYear: '',
      });
      break;
    }
  }

  // 7. Social Links
  const linkedinMatch = normalizedText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = normalizedText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);

  // 8. Summary excerpt
  let summary = '';
  const summaryHeader = lines.findIndex((l) =>
    /^(summary|profile|professional summary|about me|objective):?$/i.test(l)
  );
  if (summaryHeader !== -1 && lines[summaryHeader + 1]) {
    summary = lines.slice(summaryHeader + 1, summaryHeader + 4).join(' ');
  } else {
    summary = lines.slice(0, 3).join(' ');
  }

  return {
    fullName: candidateName,
    email: email || `applicant_${Date.now()}@example.com`,
    phone,
    summary: summary.slice(0, 500),
    extractedSkills: Array.from(foundSkills),
    calculatedTotalExperienceYears: Math.round(estimatedYears * 10) / 10,
    highestDegree,
    education,
    linkedinUrl: linkedinMatch ? linkedinMatch[0] : '',
    githubUrl: githubMatch ? githubMatch[0] : '',
  };
};
