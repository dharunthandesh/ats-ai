/**
 * Generates human-readable explanation and recommendations for recruiter decision-making
 */
export const generateMatchExplanation = ({
  overallScore,
  skillsScore,
  experienceScore,
  educationScore,
  textSimilarityScore,
  matchedSkills,
  missingSkills,
  candidateExp,
  requiredExp,
  highestDegree,
}) => {
  const points = [];

  // Skill analysis
  if (missingSkills.length === 0 && matchedSkills.length > 0) {
    points.push(`Matches all ${matchedSkills.length} required skill(s) (${matchedSkills.join(', ')}).`);
  } else if (matchedSkills.length > 0) {
    points.push(
      `Covers ${matchedSkills.length} key required skill(s) [${matchedSkills.slice(0, 4).join(', ')}]. Missing: [${missingSkills.slice(0, 3).join(', ')}].`
    );
  } else {
    points.push(`Lacks direct matches for required job skills: [${missingSkills.slice(0, 3).join(', ')}].`);
  }

  // Experience analysis
  const expDiff = candidateExp - requiredExp;
  if (expDiff >= 2) {
    points.push(
      `Exceeds minimum tenure requirements with ${candidateExp} years vs. ${requiredExp} years required (+${expDiff} yrs).`
    );
  } else if (expDiff >= 0) {
    points.push(
      `Meets experience requirements with ${candidateExp} years vs. ${requiredExp} years required.`
    );
  } else {
    points.push(
      `Candidate has ${candidateExp} years experience, which is below the requested ${requiredExp} years.`
    );
  }

  // Education summary
  if (highestDegree) {
    points.push(`Holds a ${highestDegree} credential.`);
  }

  // Recommendation verdict
  let verdict = '';
  if (overallScore >= 80) {
    verdict = 'Strong Candidate: High skill alignment and solid background. Recommended for immediate technical shortlisting.';
  } else if (overallScore >= 60) {
    verdict = 'Viable Candidate: Moderate alignment. Meets primary core competencies with some skill or domain gaps to clarify during screening.';
  } else {
    verdict = 'Low Alignment: Significant mismatch in core technical stack or years of experience.';
  }

  return `${verdict} ${points.join(' ')}`;
};
