import { calculateCosineSimilarity } from './similarity.js';
import { generateMatchExplanation } from './explainer.js';
import { SKILL_ALIASES } from '../../constants/skillTaxonomy.js';

/**
 * Normalizes a skill string to its canonical form
 */
const normalizeSkill = (skill) => {
  const lower = skill.trim().toLowerCase();
  return SKILL_ALIASES[lower] || skill.trim();
};

/**
 * Evaluates degree score (0 - 100)
 */
const calculateEducationScore = (degree = '') => {
  const lower = degree.toLowerCase();
  if (lower.includes('ph.d') || lower.includes('doctor')) return 100;
  if (lower.includes('master') || lower.includes('mba') || lower.includes('m.s') || lower.includes('mca')) return 90;
  if (lower.includes('bachelor') || lower.includes('b.s') || lower.includes('b.tech') || lower.includes('bca')) return 80;
  if (lower.includes('associate') || lower.includes('diploma')) return 65;
  return 60;
};

/**
 * Executes multi-factor composite scoring between a Candidate profile and a Job requisition
 * @param {object} candidate - Candidate document or parsed profile
 * @param {object} job - Job document
 * @returns {object} Overall score, breakdown, matched/missing skills, and explanation
 */
export const calculateCandidateMatch = (candidate, job) => {
  const candidateSkills = (candidate.extractedSkills || []).map(normalizeSkill);
  const candidateSkillsSet = new Set(candidateSkills.map((s) => s.toLowerCase()));

  const requiredSkills = (job.requiredSkills || []).map(normalizeSkill);
  const preferredSkills = (job.preferredSkills || []).map(normalizeSkill);

  // 1. Skill Match Score (40% Weight)
  const matchedRequired = [];
  const missingRequired = [];

  for (const reqSkill of requiredSkills) {
    if (candidateSkillsSet.has(reqSkill.toLowerCase())) {
      matchedRequired.push(reqSkill);
    } else {
      missingRequired.push(reqSkill);
    }
  }

  const matchedPreferred = [];
  for (const prefSkill of preferredSkills) {
    if (candidateSkillsSet.has(prefSkill.toLowerCase())) {
      matchedPreferred.push(prefSkill);
    }
  }

  const requiredRatio = requiredSkills.length > 0 ? matchedRequired.length / requiredSkills.length : 1;
  const preferredRatio = preferredSkills.length > 0 ? matchedPreferred.length / preferredSkills.length : 1;

  // 80% weight on required, 20% weight on preferred
  const skillsScore = Math.round((requiredRatio * 0.8 + preferredRatio * 0.2) * 100);

  // 2. Experience Match Score (25% Weight)
  const candidateExp = candidate.calculatedTotalExperienceYears || 0;
  const requiredExp = job.minExperienceYears || 0;
  let experienceScore = 100;

  if (requiredExp > 0) {
    if (candidateExp >= requiredExp) {
      // Full marks, plus bonus for seasoned candidates capped at 100
      experienceScore = 100;
    } else {
      experienceScore = Math.round((candidateExp / requiredExp) * 100);
    }
  }

  // 3. Education Match Score (15% Weight)
  const educationScore = calculateEducationScore(candidate.highestDegree);

  // 4. Cosine Text Similarity (20% Weight)
  const jobFullText = `${job.title} ${job.description} ${(job.responsibilities || []).join(' ')} ${requiredSkills.join(' ')}`;
  const candidateFullText = `${candidate.summary} ${candidate.resumeRawText || ''} ${(candidate.extractedSkills || []).join(' ')}`;
  const textSimilarityScore = calculateCosineSimilarity(jobFullText, candidateFullText);

  // Composite Weighted Sum
  const overallMatchScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        skillsScore * 0.4 +
        experienceScore * 0.25 +
        educationScore * 0.15 +
        textSimilarityScore * 0.2
      )
    )
  );

  const matchedSkills = Array.from(new Set([...matchedRequired, ...matchedPreferred]));
  const missingSkills = missingRequired;

  const matchExplanation = generateMatchExplanation({
    overallScore: overallMatchScore,
    skillsScore,
    experienceScore,
    educationScore,
    textSimilarityScore,
    matchedSkills,
    missingSkills,
    candidateExp,
    requiredExp,
    highestDegree: candidate.highestDegree,
  });

  return {
    overallMatchScore,
    matchBreakdown: {
      skillsScore,
      experienceScore,
      educationScore,
      textSimilarityScore,
    },
    matchedSkills,
    missingSkills,
    matchExplanation,
  };
};
