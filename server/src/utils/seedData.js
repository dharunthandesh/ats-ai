import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Candidate } from '../models/Candidate.js';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';
import { Evaluation } from '../models/Evaluation.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { ROLES } from '../constants/roles.js';
import { calculateCandidateMatch } from '../services/matching/scoringEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedDatabase = async ({ exitOnComplete = true, clearExisting = true } = {}) => {
  if (mongoose.connection.readyState !== 1) {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/talentpulse_ats';
    console.log(`[Seeder] Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
  }

  if (clearExisting) {
    console.log('[Seeder] Clearing previous data...');
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Candidate.deleteMany({}),
      Application.deleteMany({}),
      Interview.deleteMany({}),
      Evaluation.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);
  } else {
    const count = await User.countDocuments();
    if (count > 0) {
      console.log(`[Seeder] Found existing database data (${count} users). Skipping fresh seed.`);
      if (exitOnComplete) process.exit(0);
      return;
    }
  }

  // Ensure uploads directory exists
  const uploadDir = path.join(__dirname, '../../uploads/resumes');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Create dummy sample resume file
  const sampleResumePath = path.join(uploadDir, 'Sample_FullStack_Resume.pdf');
  if (!fs.existsSync(sampleResumePath)) {
    fs.writeFileSync(sampleResumePath, '%PDF-1.4 sample PDF resume content for test downloads');
  }

  console.log('[Seeder] Creating users with role profiles...');
  const users = await User.create([
    {
      name: 'Elena Rostova',
      email: 'admin@talentpulse.ai',
      password: 'password123',
      role: ROLES.HR_ADMIN,
      department: 'Human Resources',
      title: 'VP of Talent Acquisition',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Marcus Chen',
      email: 'recruiter@talentpulse.ai',
      password: 'password123',
      role: ROLES.RECRUITER,
      department: 'Talent Acquisition',
      title: 'Senior Technical Recruiter',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Dr. Sarah Sterling',
      email: 'interviewer@talentpulse.ai',
      password: 'password123',
      role: ROLES.INTERVIEWER,
      department: 'Engineering',
      title: 'Principal Software Architect',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
  ]);

  const [adminUser, recruiterUser, interviewerUser] = users;

  console.log('[Seeder] Creating job requisitions...');
  const jobs = await Job.create([
    {
      title: 'Senior Full-Stack Engineer (React / Node.js)',
      department: 'Engineering',
      location: 'San Francisco, CA (Hybrid)',
      employmentType: 'FULL_TIME',
      experienceLevel: 'SENIOR',
      minExperienceYears: 4,
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript', 'REST API'],
      preferredSkills: ['Tailwind CSS', 'Docker', 'AWS', 'Redis', 'GraphQL'],
      description: 'We are seeking an experienced Senior Full-Stack Engineer to lead the architecture of our cloud recruitment and candidate matching microservices.',
      responsibilities: [
        'Architect and implement scalable RESTful and GraphQL APIs with Node.js and Express.',
        'Develop responsive and interactive UI components using React, Tailwind CSS, and Vite.',
        'Optimize database queries and schema designs on MongoDB.',
        'Participate in code reviews, CI/CD automation, and mentorship of junior engineers.',
      ],
      salaryRange: { min: 140000, max: 185000, currency: 'USD' },
      status: 'ACTIVE',
      createdBy: recruiterUser._id,
    },
    {
      title: 'AI / NLP Machine Learning Specialist',
      department: 'AI Research',
      location: 'Remote',
      employmentType: 'FULL_TIME',
      experienceLevel: 'LEAD',
      minExperienceYears: 5,
      requiredSkills: ['Python', 'NLP', 'PyTorch', 'TensorFlow', 'Machine Learning', 'Scikit-learn'],
      preferredSkills: ['Docker', 'AWS', 'FastAPI', 'Pandas', 'OpenAI'],
      description: 'Lead the continuous enhancement of our semantic resume parsing, entity extraction, and multi-factor ranking algorithms.',
      responsibilities: [
        'Design deep learning and transformer-based models for semantic resume understanding.',
        'Develop cosine similarity and embedding pipelines for talent matching.',
        'Collaborate with product engineers to deploy low-latency inference endpoints.',
      ],
      salaryRange: { min: 165000, max: 210000, currency: 'USD' },
      status: 'ACTIVE',
      createdBy: adminUser._id,
    },
    {
      title: 'DevOps & Cloud Infrastructure Engineer',
      department: 'Infrastructure',
      location: 'Austin, TX',
      employmentType: 'FULL_TIME',
      experienceLevel: 'MID',
      minExperienceYears: 3,
      requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform'],
      preferredSkills: ['Bash', 'Python', 'Nginx', 'GitHub Actions'],
      description: 'Ensure 99.99% availability, automated deployments, and high-security compliance for our microservices cluster.',
      responsibilities: [
        'Manage Kubernetes clusters and container orchestration.',
        'Build automated CI/CD pipelines via GitHub Actions.',
        'Implement infrastructure as code using Terraform.',
      ],
      salaryRange: { min: 125000, max: 155000, currency: 'USD' },
      status: 'ACTIVE',
      createdBy: recruiterUser._id,
    },
  ]);

  const [jobFullStack, jobAI, jobDevOps] = jobs;

  console.log('[Seeder] Creating candidates with parsed profiles...');
  const candidates = await Candidate.create([
    {
      fullName: 'Alex Vance',
      email: 'alex.vance@techdev.io',
      phone: '+1 (555) 234-5678',
      location: 'Seattle, WA',
      summary: 'Seasoned Full-Stack developer with 6 years experience building cloud-native web apps with React, Node.js, Express, MongoDB, and TypeScript.',
      extractedSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Docker', 'REST API', 'Redis'],
      calculatedTotalExperienceYears: 6,
      highestDegree: 'Bachelor',
      education: [{ institution: 'University of Washington', degree: 'Bachelor of Science', fieldOfStudy: 'Computer Science', gradYear: '2019' }],
      resumeOriginalName: 'Alex_Vance_Resume.pdf',
      resumeFilePath: sampleResumePath,
      resumeRawText: 'Senior Full Stack Software Engineer. Skills: React, Node.js, Express, TypeScript, JavaScript, MongoDB, Tailwind CSS, Docker. 6+ years experience.',
    },
    {
      fullName: 'Dr. Priya Sharma',
      email: 'priya.sharma@mlresearch.org',
      phone: '+1 (555) 987-6543',
      location: 'Boston, MA',
      summary: 'AI / NLP Researcher with PhD in Computer Science. Specialized in Large Language Models, PyTorch, semantic similarity, and tokenization algorithms.',
      extractedSkills: ['Python', 'NLP', 'PyTorch', 'TensorFlow', 'Machine Learning', 'Scikit-learn', 'Pandas', 'FastAPI', 'Docker'],
      calculatedTotalExperienceYears: 7,
      highestDegree: 'Ph.D.',
      education: [{ institution: 'MIT', degree: 'Ph.D.', fieldOfStudy: 'Artificial Intelligence & NLP', gradYear: '2020' }],
      resumeOriginalName: 'Priya_Sharma_CV.pdf',
      resumeFilePath: sampleResumePath,
      resumeRawText: 'Research Scientist. Ph.D. in NLP. Expert in Python, PyTorch, Transformers, Deep Learning, Scikit-learn, vector search, and model explainability.',
    },
    {
      fullName: 'David Thorne',
      email: 'david.thorne@cloudsys.net',
      phone: '+1 (555) 345-6789',
      location: 'Denver, CO',
      summary: 'Cloud Infrastructure and Site Reliability Engineer with 4 years experience in Kubernetes clusters, Docker containers, AWS, and Terraform.',
      extractedSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform', 'GitHub Actions', 'Bash'],
      calculatedTotalExperienceYears: 4,
      highestDegree: 'Bachelor',
      education: [{ institution: 'Colorado State University', degree: 'Bachelor', fieldOfStudy: 'Information Technology', gradYear: '2021' }],
      resumeOriginalName: 'David_Thorne_DevOps.pdf',
      resumeFilePath: sampleResumePath,
      resumeRawText: 'DevOps Engineer. 4 years maintaining high-availability AWS and Kubernetes clusters. Terraform, CI/CD, Linux, Docker, Bash.',
    },
    {
      fullName: 'Liam O\'Connor',
      email: 'liam.oc@devstudio.com',
      phone: '+1 (555) 456-7890',
      location: 'Chicago, IL',
      summary: 'Mid-level web engineer with React and Node.js skills, eager to transition into senior roles.',
      extractedSkills: ['React', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'Express', 'Git'],
      calculatedTotalExperienceYears: 3,
      highestDegree: 'Bachelor',
      education: [{ institution: 'University of Illinois', degree: 'Bachelor', fieldOfStudy: 'Software Engineering', gradYear: '2022' }],
      resumeOriginalName: 'Liam_OConnor_Resume.pdf',
      resumeFilePath: sampleResumePath,
      resumeRawText: 'Software Engineer with 3 years experience in React frontend and Node.js backend development.',
    },
    {
      fullName: 'Samantha Sterling',
      email: 'sam.sterling@codecraft.io',
      phone: '+1 (555) 789-0123',
      location: 'Austin, TX',
      summary: 'Senior Cloud & Full Stack Engineer with extensive experience in React, TypeScript, Node.js, and AWS microservices.',
      extractedSkills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'AWS', 'Docker', 'GraphQL', 'Tailwind CSS'],
      calculatedTotalExperienceYears: 5,
      highestDegree: 'Master',
      education: [{ institution: 'UT Austin', degree: 'Master of Science', fieldOfStudy: 'Computer Science', gradYear: '2020' }],
      resumeOriginalName: 'Samantha_Sterling_Profile.pdf',
      resumeFilePath: sampleResumePath,
      resumeRawText: 'Senior Full Stack and Cloud Engineer with 5 years experience across React, Node, MongoDB, AWS, and modern DevOps.',
    },
    {
      fullName: 'Carlos Mendoza',
      email: 'carlos.mendoza@dataspark.co',
      phone: '+1 (555) 678-9012',
      location: 'San Jose, CA',
      summary: 'Data & Machine Learning Engineer with Python, Pandas, NLP, and SQL expertise.',
      extractedSkills: ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Scikit-learn', 'NLP', 'FastAPI'],
      calculatedTotalExperienceYears: 4,
      highestDegree: 'Master',
      education: [{ institution: 'San Jose State University', degree: 'Master', fieldOfStudy: 'Data Analytics', gradYear: '2021' }],
      resumeOriginalName: 'Carlos_Mendoza_Resume.pdf',
      resumeFilePath: sampleResumePath,
      resumeRawText: 'Data and Machine Learning Practitioner with 4 years experience applying NLP and scikit-learn models.',
    },
  ]);

  const [alex, priya, david, liam, samantha, carlos] = candidates;

  console.log('[Seeder] Generating AI Match scores and Pipeline Applications...');
  const appData = [
    { candidate: alex, job: jobFullStack, stage: 'SHORTLISTED' },
    { candidate: samantha, job: jobFullStack, stage: 'TECHNICAL_ROUND' },
    { candidate: liam, job: jobFullStack, stage: 'SCREENING' },
    { candidate: priya, job: jobAI, stage: 'OFFER_EXTENDED' },
    { candidate: carlos, job: jobAI, stage: 'SHORTLISTED' },
    { candidate: david, job: jobDevOps, stage: 'HIRED' },
  ];

  const applications = [];
  for (const item of appData) {
    const match = calculateCandidateMatch(item.candidate, item.job);
    const app = await Application.create({
      jobId: item.job._id,
      candidateId: item.candidate._id,
      stage: item.stage,
      overallMatchScore: match.overallMatchScore,
      matchBreakdown: match.matchBreakdown,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      matchExplanation: match.matchExplanation,
      currentAssignee: recruiterUser._id,
      offerDetails:
        item.stage === 'OFFER_EXTENDED' || item.stage === 'HIRED'
          ? {
              amount: 175000,
              currency: 'USD',
              startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              status: item.stage === 'HIRED' ? 'ACCEPTED' : 'PENDING',
              sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            }
          : undefined,
    });
    applications.push(app);

    await ActivityLog.create({
      applicationId: app._id,
      actorId: recruiterUser._id,
      actionType: 'STAGE_CHANGE',
      previousState: 'APPLIED',
      newState: item.stage,
      notes: `Candidate progressed to ${item.stage}. AI Match Score: ${match.overallMatchScore}%`,
    });
  }

  console.log('[Seeder] Creating scheduled interviews and scorecards...');
  const interviewTech = await Interview.create({
    applicationId: applications[1]._id, // Samantha
    jobId: jobFullStack._id,
    candidateId: samantha._id,
    interviewers: [interviewerUser._id],
    roundType: 'TECHNICAL',
    scheduledStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    scheduledEndTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
    meetingLink: 'https://meet.google.com/tp-tech-sam',
    locationNotes: 'Google Meet - Architecture & Live Coding',
    status: 'SCHEDULED',
  });

  const interviewAI = await Interview.create({
    applicationId: applications[3]._id, // Priya
    jobId: jobAI._id,
    candidateId: priya._id,
    interviewers: [interviewerUser._id, adminUser._id],
    roundType: 'TECHNICAL',
    scheduledStartTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Past
    scheduledEndTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000),
    meetingLink: 'https://meet.google.com/tp-ai-priya',
    locationNotes: 'Google Meet - NLP Deep Dive',
    status: 'COMPLETED',
  });

  // Scorecard for Priya's completed interview
  await Evaluation.create({
    interviewId: interviewAI._id,
    interviewerId: interviewerUser._id,
    applicationId: applications[3]._id,
    technicalSkillsRating: 5,
    problemSolvingRating: 5,
    communicationRating: 4,
    culturalFitRating: 5,
    overallScore: 5,
    recommendation: 'STRONG_HIRE',
    strengths: 'Exceptional mastery of NLP vector spaces, transformer embeddings, and scalable inference architecture. Clear communicator with deep domain knowledge.',
    areasOfImprovement: 'Minor: Primarily experienced with research frameworks; needs brief orientation on production Node.js orchestration.',
    privateNotes: 'Top 1% candidate for the AI specialist vacancy. Recommend immediate offer.',
  });

  console.log('\n=============================================================');
  console.log(' SEEDING COMPLETE! TEST USERS AVAILABLE:');
  console.log('-------------------------------------------------------------');
  console.log(' 1. HR Administrator:     admin@talentpulse.ai       / password123');
  console.log(' 2. Recruiter:            recruiter@talentpulse.ai   / password123');
  console.log(' 3. Technical Interviewer: interviewer@talentpulse.ai / password123');
  console.log('=============================================================\n');

  if (exitOnComplete) {
    process.exit(0);
  }
};

const isDirectRun = process.argv[1]?.replace(/\\/g, '/').endsWith('seedData.js');
if (isDirectRun) {
  seedDatabase({ exitOnComplete: true, clearExisting: true }).catch((err) => {
    console.error('[Seeder Error]:', err);
    process.exit(1);
  });
}
