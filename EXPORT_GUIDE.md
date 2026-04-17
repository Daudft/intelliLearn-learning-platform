// PDF Export Implementation Guide
// This file contains example code for exporting progress reports as PDF

// ==================================================
// INSTALLATION
// ==================================================
/*
npm install jspdf html2canvas
*/

// ==================================================
// EXAMPLE: Add to ProgressDashboard.jsx
// ==================================================

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Add this function to ProgressDashboard component
const exportProgressReportPDF = async () => {
  try {
    // Create a new PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    let yPosition = 15;

    // Header
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('Learning Progress Report', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;

    // Overall Statistics
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Overall Statistics', 15, yPosition);

    yPosition += 10;
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');

    const stats = [
      `Tasks Completed: ${stats?.stats?.totalTasksCompleted || 0}`,
      `Assessments Taken: ${stats?.stats?.totalAssessmentsTaken || 0}`,
      `Average Score: ${stats?.stats?.averageAssessmentScore || 0}%`,
      `Badges Earned: ${stats?.stats?.totalBadgesEarned || 0}`,
      `Total Points: ${stats?.stats?.totalPoints || 0}`,
      `Streak Days: ${stats?.stats?.streakDays || 0}`,
    ];

    stats.forEach((stat) => {
      pdf.text(`• ${stat}`, 20, yPosition);
      yPosition += 8;
    });

    yPosition += 10;

    // Language-wise Progress
    if (stats?.languageStats && Object.keys(stats.languageStats).length > 0) {
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Language-wise Progress', 15, yPosition);

      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');

      Object.entries(stats.languageStats).forEach(([language, data]) => {
        const progressPercent = (data.completed / data.total) * 100;
        pdf.text(`${language.toUpperCase()}:`, 20, yPosition);
        pdf.text(
          `${data.completed}/${data.total} tasks (${progressPercent.toFixed(0)}%) - ${data.proficiencyLevel}`,
          60,
          yPosition
        );
        yPosition += 8;
      });
    }

    yPosition += 10;

    // Recent Assessments
    if (stats?.recentAssessments && stats.recentAssessments.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Recent Assessments', 15, yPosition);

      yPosition += 10;
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');

      const assessmentData = stats.recentAssessments.slice(0, 5).map((a) => [
        new Date(a.completedAt).toLocaleDateString(),
        a.language.toUpperCase(),
        `${a.percentage}%`,
        `${a.score}/${a.totalQuestions}`,
      ]);

      pdf.autoTable({
        startY: yPosition,
        head: [['Date', 'Language', 'Score', 'Details']],
        body: assessmentData,
        margin: 15,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [66, 139, 202] },
      });

      yPosition = pdf.lastAutoTable.finalY + 10;
    }

    // Add page numbers
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Download the PDF
    pdf.save(`learning-progress-report-${new Date().getTime()}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF');
  }
};

// ==================================================
// CSV EXPORT EXAMPLE
// ==================================================

const exportProgressReportCSV = () => {
  try {
    let csvContent = 'Learning Progress Report\n';
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

    // Stats section
    csvContent += 'Overall Statistics\n';
    csvContent += `Tasks Completed,${stats?.stats?.totalTasksCompleted || 0}\n`;
    csvContent += `Assessments Taken,${stats?.stats?.totalAssessmentsTaken || 0}\n`;
    csvContent += `Average Score %,${stats?.stats?.averageAssessmentScore || 0}\n`;
    csvContent += `Badges Earned,${stats?.stats?.totalBadgesEarned || 0}\n`;
    csvContent += `Total Points,${stats?.stats?.totalPoints || 0}\n`;
    csvContent += `Streak Days,${stats?.stats?.streakDays || 0}\n\n`;

    // Language stats
    csvContent += 'Language-wise Progress\n';
    csvContent += 'Language,Completed Tasks,Total Tasks,Proficiency Level\n';
    
    Object.entries(stats?.languageStats || {}).forEach(([language, data]) => {
      csvContent += `${language},${data.completed},${data.total},${data.proficiencyLevel}\n`;
    });

    csvContent += '\n\nRecent Assessments\n';
    csvContent += 'Date,Language,Score %,Correct Answers\n';

    stats?.recentAssessments?.forEach((assessment) => {
      csvContent += `${new Date(assessment.completedAt).toLocaleDateString()},`;
      csvContent += `${assessment.language.toUpperCase()},`;
      csvContent += `${assessment.percentage},`;
      csvContent += `${assessment.score}/${assessment.totalQuestions}\n`;
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `learning-progress-report-${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error generating CSV:', error);
    alert('Failed to generate CSV');
  }
};

// ==================================================
// ADD BUTTONS TO UI
// ==================================================

/*
In ProgressDashboard.jsx, add to the JSX:

<div className="flex gap-4 mt-6">
  <button
    onClick={exportProgressReportPDF}
    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
  >
    📥 Export as PDF
  </button>
  <button
    onClick={exportProgressReportCSV}
    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
  >
    📊 Export as CSV
  </button>
</div>
*/

// ==================================================
// EMAIL EXPORT EXAMPLE
// ==================================================

const emailProgressReport = async () => {
  try {
    const reportData = {
      userId: userId,
      stats: stats?.stats,
      languageStats: stats?.languageStats,
      recentAssessments: stats?.recentAssessments,
      generatedAt: new Date().toISOString(),
    };

    // Send to backend endpoint
    const response = await fetch('/api/users/email-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });

    if (response.ok) {
      alert('Report sent to your email!');
    } else {
      throw new Error('Failed to send report');
    }
  } catch (error) {
    console.error('Error emailing report:', error);
    alert('Failed to email report');
  }
};

// ==================================================
// BACKEND ENDPOINT EXAMPLE (Node.js/Express)
// ==================================================

/*
In backend/controllers/userController.js, add:

exports.emailProgressReport = async (req, res) => {
  try {
    const { userId, stats, languageStats, recentAssessments } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create email content
    const emailContent = `
      <h2>Your Learning Progress Report</h2>
      <p>Hi ${user.name},</p>
      <h3>Overall Statistics</h3>
      <ul>
        <li>Tasks Completed: ${stats?.totalTasksCompleted || 0}</li>
        <li>Assessments Taken: ${stats?.totalAssessmentsTaken || 0}</li>
        <li>Average Score: ${stats?.averageAssessmentScore || 0}%</li>
        <li>Badges Earned: ${stats?.totalBadgesEarned || 0}</li>
        <li>Total Points: ${stats?.totalPoints || 0}</li>
      </ul>
      <p>Keep up the great work!</p>
    `;

    // Send email using nodemailer
    await sendEmail(user.email, 'Your Learning Progress Report', emailContent);

    res.status(200).json({ message: 'Report sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add route in backend/routes/userRoutes.js:
router.post('/email-report', protect, emailProgressReport);
*/

export {
  exportProgressReportPDF,
  exportProgressReportCSV,
  emailProgressReport,
};
