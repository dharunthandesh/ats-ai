import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  User,
  Job,
  Candidate,
  Resume,
  CandidateSkill,
  Application,
  Interview,
  InterviewFeedback,
  Notification,
  AuditLog,
  USER_ROLES,
  JOB_STATUSES,
  EMPLOYMENT_TYPES,
  PIPELINE_STAGES,
  INTERVIEW_TYPES,
  INTERVIEW_STATUSES,
  RECOMMENDATIONS,
  NOTIFICATION_TYPES,
  AUDIT_ACTIONS,
} from '../models/index.js';

const verifyModels = async () => {
  console.log('\n--- Commencing Mongoose Model Verification ---');
  await connectDB();

  const models = [
    { name: 'User', model: User },
    { name: 'Job', model: Job },
    { name: 'Candidate', model: Candidate },
    { name: 'Resume', model: Resume },
    { name: 'CandidateSkill', model: CandidateSkill },
    { name: 'Application', model: Application },
    { name: 'Interview', model: Interview },
    { name: 'InterviewFeedback', model: InterviewFeedback },
    { name: 'Notification', model: Notification },
    { name: 'AuditLog', model: AuditLog },
  ];

  console.log(`\nVerifying ${models.length} Mongoose models registration and schema validation...\n`);

  for (const { name, model } of models) {
    if (!model || !model.schema) {
      throw new Error(`Model ${name} failed to load properly.`);
    }

    const indexes = model.schema.indexes();
    console.log(`[PASS] Model '${name}' loaded successfully. Indexes defined: ${indexes.length}`);
  }

  // Test schema instantiation and validation
  console.log('\nTesting document validation on instantiated sample instances...');

  const dummyUserId = new mongoose.Types.ObjectId();
  const dummyCandidateId = new mongoose.Types.ObjectId();
  const dummyJobId = new mongoose.Types.ObjectId();
  const dummyAppId = new mongoose.Types.ObjectId();
  const dummyInterviewId = new mongoose.Types.ObjectId();

  const sampleUser = new User({
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    password: 'securePassword123',
    role: USER_ROLES.HR_ADMIN,
    isActive: true,
  });
  await sampleUser.validate();
  console.log('[PASS] User validation passed.');

  const sampleJob = new Job({
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    description: 'Lead engineering initiatives',
    requiredSkills: ['React', 'Node.js'],
    preferredSkills: ['MongoDB', 'TypeScript'],
    minimumExperience: 4,
    location: 'Remote',
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    status: JOB_STATUSES.ACTIVE,
    createdBy: dummyUserId,
  });
  await sampleJob.validate();
  console.log('[PASS] Job validation passed.');

  const sampleCandidate = new Candidate({
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 555-0199',
    location: 'New York, NY',
    totalExperience: 5,
    education: [
      {
        institution: 'Columbia University',
        degree: 'BS',
        fieldOfStudy: 'Computer Science',
        gradYear: '2020',
      },
    ],
  });
  await sampleCandidate.validate();
  console.log('[PASS] Candidate validation passed.');

  const sampleResume = new Resume({
    candidateId: dummyCandidateId,
    originalName: 'John_Smith_Resume.pdf',
    filePath: 'uploads/resumes/dummy.pdf',
    mimeType: 'application/pdf',
    fileSize: 102400,
    rawText: 'Experienced Software Engineer with proficiency in React and Node.js...',
  });
  await sampleResume.validate();
  console.log('[PASS] Resume validation passed.');

  const sampleSkill = new CandidateSkill({
    candidateId: dummyCandidateId,
    skillName: 'React.js',
    category: 'FRONTEND',
    proficiencyLevel: 'ADVANCED',
    yearsOfExperience: 5,
    isVerified: true,
  });
  await sampleSkill.validate();
  console.log('[PASS] CandidateSkill validation passed.');

  const sampleApp = new Application({
    candidateId: dummyCandidateId,
    jobId: dummyJobId,
    matchScore: 92,
    ranking: 1,
    pipelineStage: PIPELINE_STAGES.SHORTLISTED,
    status: 'ACTIVE',
  });
  await sampleApp.validate();
  console.log('[PASS] Application validation passed.');

  const sampleInterview = new Interview({
    applicationId: dummyAppId,
    interviewer: dummyUserId,
    interviewType: INTERVIEW_TYPES.TECHNICAL,
    scheduledAt: new Date(Date.now() + 86400000),
    duration: 60,
    meetingLink: 'https://meet.google.com/xyz-test',
    status: INTERVIEW_STATUSES.SCHEDULED,
  });
  await sampleInterview.validate();
  console.log('[PASS] Interview validation passed.');

  const sampleFeedback = new InterviewFeedback({
    interviewId: dummyInterviewId,
    applicationId: dummyAppId,
    interviewerId: dummyUserId,
    ratings: {
      technicalSkills: 5,
      problemSolving: 4,
      communication: 4,
      culturalFit: 5,
    },
    overallScore: 5,
    recommendation: RECOMMENDATIONS.STRONG_HIRE,
    strengths: 'Solid system architecture understanding',
    areasOfImprovement: 'None noted',
  });
  await sampleFeedback.validate();
  console.log('[PASS] InterviewFeedback validation passed.');

  const sampleNotification = new Notification({
    recipient: dummyUserId,
    title: 'Interview Reminder',
    message: 'Technical interview starting in 30 minutes',
    type: NOTIFICATION_TYPES.INTERVIEW_REMINDER,
    relatedEntity: {
      entityType: 'Interview',
      entityId: dummyInterviewId,
    },
  });
  await sampleNotification.validate();
  console.log('[PASS] Notification validation passed.');

  const sampleAudit = new AuditLog({
    actor: dummyUserId,
    action: AUDIT_ACTIONS.STAGE_TRANSITION,
    entityType: 'Application',
    entityId: dummyAppId,
    previousState: { pipelineStage: 'APPLIED' },
    newState: { pipelineStage: 'SHORTLISTED' },
    notes: 'Candidate met 90%+ skill match threshold',
  });
  await sampleAudit.validate();
  console.log('[PASS] AuditLog validation passed.');

  console.log('\n============================================================');
  console.log(' ALL 10 MONGOOSE MODELS LOADED AND VALIDATED WITH ZERO ERRORS');
  console.log('============================================================\n');

  await disconnectDB();
  process.exit(0);
};

verifyModels().catch(async (err) => {
  console.error('\n[Model Verification Error]:', err);
  await disconnectDB();
  process.exit(1);
});
