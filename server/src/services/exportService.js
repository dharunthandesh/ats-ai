import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

/**
 * Generates CSV string from candidate applications
 * @param {Array} applications
 * @returns {string} CSV formatted data
 */
export const exportApplicationsCsv = (applications = []) => {
  const fields = [
    { label: 'Candidate Name', value: 'candidateName' },
    { label: 'Email', value: 'candidateEmail' },
    { label: 'Phone', value: 'candidatePhone' },
    { label: 'Job Title', value: 'jobTitle' },
    { label: 'Department', value: 'department' },
    { label: 'Pipeline Stage', value: 'stage' },
    { label: 'Overall Match Score (%)', value: 'overallMatchScore' },
    { label: 'Skills Match (%)', value: 'matchBreakdown.skillsScore' },
    { label: 'Experience Match (%)', value: 'matchBreakdown.experienceScore' },
    { label: 'Education Match (%)', value: 'matchBreakdown.educationScore' },
    { label: 'Text Similarity (%)', value: 'matchBreakdown.textSimilarityScore' },
    { label: 'Matched Skills', value: (row) => (row.matchedSkills || []).join('; ') },
    { label: 'Missing Skills', value: (row) => (row.missingSkills || []).join('; ') },
    { label: 'Applied At', value: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  const data = applications.map((app) => ({
    candidateName: app.candidateId?.fullName || 'N/A',
    candidateEmail: app.candidateId?.email || 'N/A',
    candidatePhone: app.candidateId?.phone || 'N/A',
    jobTitle: app.jobId?.title || 'N/A',
    department: app.jobId?.department || 'N/A',
    stage: app.stage,
    overallMatchScore: app.overallMatchScore,
    matchBreakdown: app.matchBreakdown,
    matchedSkills: app.matchedSkills,
    missingSkills: app.missingSkills,
    createdAt: app.createdAt,
  }));

  const parser = new Parser({ fields });
  return parser.parse(data);
};

/**
 * Generates executive PDF report stream
 * @param {object} stats - Aggregated analytics statistics
 * @param {Array} topCandidates - Top ranked applications
 * @param {object} res - Express response stream
 */
export const exportAnalyticsPdf = (stats, topCandidates, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=TalentPulse_Recruitment_Report.pdf');
  doc.pipe(res);

  // Header Banner
  doc.rect(0, 0, doc.page.width, 90).fill('#1e1b4b');
  doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('TalentPulse ATS', 40, 30);
  doc.fontSize(12).font('Helvetica').text('Executive Recruitment & Pipeline Performance Report', 40, 60);

  doc.moveDown(4);
  doc.fillColor('#334155').fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString()}`, 40, 105);

  // Divider
  doc.moveTo(40, 125).lineTo(doc.page.width - 40, 125).strokeColor('#cbd5e1').stroke();

  // Metrics Grid
  doc.moveDown(2);
  doc.fontSize(16).fillColor('#0f172a').font('Helvetica-Bold').text('Key Recruitment Metrics', 40, 140);

  const startY = 170;
  const colWidth = 120;
  const metrics = [
    { label: 'Active Requisitions', val: stats.totalJobs || 0 },
    { label: 'Total Candidates', val: stats.totalCandidates || 0 },
    { label: 'Applications', val: stats.totalApplications || 0 },
    { label: 'Interviews Held', val: stats.totalInterviews || 0 },
  ];

  metrics.forEach((m, idx) => {
    const x = 40 + idx * (colWidth + 10);
    doc.rect(x, startY, colWidth, 60).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(m.label, x + 8, startY + 12);
    doc.fillColor('#4338ca').fontSize(18).font('Helvetica-Bold').text(String(m.val), x + 8, startY + 30);
  });

  // Funnel Breakdown Table
  let currentY = 255;
  doc.fontSize(14).fillColor('#0f172a').font('Helvetica-Bold').text('Pipeline Funnel Distribution', 40, currentY);
  currentY += 25;

  doc.rect(40, currentY, doc.page.width - 80, 24).fill('#e0e7ff');
  doc.fillColor('#312e81').fontSize(10).font('Helvetica-Bold')
    .text('Pipeline Stage', 50, currentY + 7)
    .text('Candidate Count', 320, currentY + 7)
    .text('Conversion Share', 440, currentY + 7);

  currentY += 24;
  const stages = stats.stageCounts || {};
  const totalApps = stats.totalApplications || 1;

  Object.entries(stages).forEach(([stage, count], index) => {
    const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
    doc.rect(40, currentY, doc.page.width - 80, 20).fill(rowBg);
    const pct = ((count / totalApps) * 100).toFixed(1);

    doc.fillColor('#334155').fontSize(9).font('Helvetica')
      .text(stage.replace(/_/g, ' '), 50, currentY + 5)
      .text(String(count), 320, currentY + 5)
      .text(`${pct}%`, 440, currentY + 5);
    currentY += 20;
  });

  // Top Ranked Candidates Table
  currentY += 25;
  if (currentY > 650) {
    doc.addPage();
    currentY = 40;
  }

  doc.fontSize(14).fillColor('#0f172a').font('Helvetica-Bold').text('Top AI-Matched Candidates', 40, currentY);
  currentY += 25;

  doc.rect(40, currentY, doc.page.width - 80, 24).fill('#e0e7ff');
  doc.fillColor('#312e81').fontSize(10).font('Helvetica-Bold')
    .text('Candidate Name', 50, currentY + 7)
    .text('Job Title', 220, currentY + 7)
    .text('Stage', 380, currentY + 7)
    .text('Match Score', 460, currentY + 7);

  currentY += 24;
  topCandidates.slice(0, 8).forEach((c, index) => {
    const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
    doc.rect(40, currentY, doc.page.width - 80, 20).fill(rowBg);

    doc.fillColor('#334155').fontSize(9).font('Helvetica')
      .text(c.candidateId?.fullName || 'Candidate', 50, currentY + 5)
      .text(c.jobId?.title || 'Role', 220, currentY + 5)
      .text(c.stage || 'APPLIED', 380, currentY + 5)
      .fillColor(c.overallMatchScore >= 80 ? '#16a34a' : '#d97706')
      .font('Helvetica-Bold')
      .text(`${c.overallMatchScore}%`, 460, currentY + 5);
    currentY += 20;
  });

  // Footer
  doc.fontSize(8).fillColor('#94a3b8').font('Helvetica').text(
    'TalentPulse AI-Enabled Recruitment Platform - Confidential Executive Document',
    40,
    doc.page.height - 30,
    { align: 'center' }
  );

  doc.end();
};
