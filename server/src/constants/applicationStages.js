export const APPLICATION_STAGES = {
  APPLIED: 'APPLIED',
  SCREENING: 'SCREENING',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  TECHNICAL_ROUND: 'TECHNICAL_ROUND',
  HR_ROUND: 'HR_ROUND',
  OFFER_EXTENDED: 'OFFER_EXTENDED',
  HIRED: 'HIRED',
  REJECTED: 'REJECTED',
};

export const PIPELINE_COLUMNS = [
  { id: APPLICATION_STAGES.APPLIED, title: 'Applied', color: 'slate' },
  { id: APPLICATION_STAGES.SCREENING, title: 'Screening', color: 'blue' },
  { id: APPLICATION_STAGES.SHORTLISTED, title: 'Shortlisted', color: 'indigo' },
  { id: APPLICATION_STAGES.INTERVIEW_SCHEDULED, title: 'Interview Scheduled', color: 'purple' },
  { id: APPLICATION_STAGES.TECHNICAL_ROUND, title: 'Technical Round', color: 'amber' },
  { id: APPLICATION_STAGES.HR_ROUND, title: 'HR Round', color: 'orange' },
  { id: APPLICATION_STAGES.OFFER_EXTENDED, title: 'Offer Extended', color: 'emerald' },
  { id: APPLICATION_STAGES.HIRED, title: 'Hired', color: 'green' },
  { id: APPLICATION_STAGES.REJECTED, title: 'Rejected', color: 'rose' },
];

export const STAGE_LIST = Object.values(APPLICATION_STAGES);
