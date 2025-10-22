import { HealingHistoryEntry } from "@/hooks/useHealingHistory";
import { format } from "date-fns";

/**
 * Generates an HTML report for a single healing entry
 */
export const generateSingleEntryReport = (entry: HealingHistoryEntry): string => {
  const date = format(new Date(entry.created_at), "MMMM dd, yyyy 'at' h:mm a");
  const title = entry.tattoo_title || 'Tattoo Analysis';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${format(new Date(entry.created_at), "MMM dd, yyyy")}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f8fafc;
    }
    .report-container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 {
      color: #0f172a;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 16px;
      margin-bottom: 24px;
      font-size: 28px;
    }
    h2 {
      color: #334155;
      margin-top: 32px;
      margin-bottom: 16px;
      font-size: 20px;
      border-left: 4px solid #3b82f6;
      padding-left: 12px;
    }
    .metadata {
      background: #f1f5f9;
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 24px;
      display: grid;
      gap: 8px;
    }
    .metadata-item {
      display: flex;
      gap: 8px;
    }
    .metadata-label {
      font-weight: 600;
      color: #475569;
    }
    .badge {
      display: inline-block;
      background: #3b82f6;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 16px;
    }
    .section {
      margin-bottom: 28px;
    }
    .section-content {
      background: #f8fafc;
      padding: 16px;
      border-radius: 6px;
      border-left: 3px solid #e2e8f0;
    }
    .warning-section {
      background: #fef2f2;
      border-left-color: #ef4444;
    }
    ul {
      margin: 8px 0;
      padding-left: 24px;
    }
    li {
      margin: 8px 0;
      color: #475569;
    }
    .assessment-grid {
      display: grid;
      gap: 16px;
      margin-top: 12px;
    }
    .assessment-item {
      background: white;
      padding: 12px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    .assessment-label {
      font-weight: 600;
      color: #334155;
      margin-bottom: 6px;
    }
    .assessment-value {
      color: #64748b;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 14px;
    }
    .print-button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 20px;
    }
    .print-button:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <div class="report-container">
    <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>
    
    <h1>${title} - Healing Analysis</h1>
    
    <div class="metadata">
      <div class="metadata-item">
        <span class="metadata-label">Analysis Date:</span>
        <span>${date}</span>
      </div>
      ${entry.analysis_result?.tattooAgeDays ? `
      <div class="metadata-item">
        <span class="metadata-label">Tattoo Age:</span>
        <span>${entry.analysis_result.tattooAgeDays} days</span>
      </div>
      ` : ''}
    </div>

    <div class="section">
      <span class="badge">${entry.healing_stage}</span>
    </div>

    ${entry.analysis_result?.summary ? `
    <div class="section">
      <h2>Analysis Summary</h2>
      <div class="section-content">
        <p>${entry.analysis_result.summary}</p>
      </div>
    </div>
    ` : `
    <div class="section">
      <h2>Analysis Summary</h2>
      <div class="section-content">
        <p>Assessed stage: ${entry.healing_stage}. ${entry.analysis_result?.concerns && entry.analysis_result.concerns !== 'None' ? entry.analysis_result.concerns : 'No major concerns observed.'}</p>
      </div>
    </div>
    `}

    ${entry.recommendations && entry.recommendations.length > 0 ? `
    <div class="section">
      <h2>Recommendations</h2>
      <div class="section-content">
        <ul>
          ${entry.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
    </div>
    ` : ''}

    ${entry.analysis_result?.risk_factors ? `
    <div class="section">
      <h2>⚠️ Risk Factors</h2>
      <div class="section-content warning-section">
        <p>${entry.analysis_result.risk_factors}</p>
      </div>
    </div>
    ` : ''}

    ${entry.analysis_result?.visual_assessment ? `
    <div class="section">
      <h2>Visual Assessment</h2>
      <div class="assessment-grid">
        ${entry.analysis_result.visual_assessment.color_assessment ? `
        <div class="assessment-item">
          <div class="assessment-label">Color Assessment</div>
          <div class="assessment-value">${entry.analysis_result.visual_assessment.color_assessment}</div>
        </div>
        ` : ''}
        ${entry.analysis_result.visual_assessment.texture_assessment ? `
        <div class="assessment-item">
          <div class="assessment-label">Texture Assessment</div>
          <div class="assessment-value">${entry.analysis_result.visual_assessment.texture_assessment}</div>
        </div>
        ` : ''}
        ${entry.analysis_result.visual_assessment.overall_condition ? `
        <div class="assessment-item">
          <div class="assessment-label">Overall Condition</div>
          <div class="assessment-value">${entry.analysis_result.visual_assessment.overall_condition}</div>
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    ${entry.analysis_result?.product_recommendations && entry.analysis_result.product_recommendations.length > 0 ? `
    <div class="section">
      <h2>Product Recommendations</h2>
      <div class="section-content">
        <ul>
          ${entry.analysis_result.product_recommendations.map((product: string) => `<li>${product}</li>`).join('')}
        </ul>
      </div>
    </div>
    ` : ''}

    <div class="footer">
      <p>This report was generated from your HealAid healing tracker.</p>
      <p>For medical concerns, please consult a healthcare professional.</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generates a comprehensive HTML report for all healing entries
 */
export const generateCompleteReport = (entries: HealingHistoryEntry[]): string => {
  if (!entries || entries.length === 0) {
    return generateEmptyReport();
  }

  const dateRange = entries.length > 1 
    ? `${format(new Date(entries[entries.length - 1].created_at), "MMM dd, yyyy")} - ${format(new Date(entries[0].created_at), "MMM dd, yyyy")}`
    : format(new Date(entries[0].created_at), "MMM dd, yyyy");

  const entriesHtml = entries.map((entry, index) => {
    const date = format(new Date(entry.created_at), "MMMM dd, yyyy 'at' h:mm a");
    
    return `
    <div class="entry-card">
      <div class="entry-header">
        <h3>Analysis #${entries.length - index} - ${date}</h3>
        <span class="badge">${entry.healing_stage}</span>
      </div>

      ${entry.analysis_result?.summary ? `
      <div class="entry-section">
        <h4>Summary</h4>
        <p>${entry.analysis_result.summary}</p>
        ${entry.analysis_result?.tattooAgeDays ? `
        <p class="tattoo-age">Tattoo Age: ${entry.analysis_result.tattooAgeDays} days</p>
        ` : ''}
      </div>
      ` : ''}

      ${entry.recommendations && entry.recommendations.length > 0 ? `
      <div class="entry-section">
        <h4>Recommendations</h4>
        <ul>
          ${entry.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      ${entry.analysis_result?.risk_factors ? `
      <div class="entry-section warning">
        <h4>⚠️ Risk Factors</h4>
        <p>${entry.analysis_result.risk_factors}</p>
      </div>
      ` : ''}
    </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Healing Journey Report</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
      .entry-card { page-break-inside: avoid; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f8fafc;
    }
    .report-container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 {
      color: #0f172a;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 16px;
      margin-bottom: 24px;
      font-size: 32px;
    }
    h2 {
      color: #334155;
      margin-top: 32px;
      margin-bottom: 20px;
      font-size: 24px;
    }
    h3 {
      color: #334155;
      margin: 0;
      font-size: 18px;
    }
    h4 {
      color: #475569;
      margin-top: 16px;
      margin-bottom: 8px;
      font-size: 16px;
      font-weight: 600;
    }
    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 24px 0 40px;
    }
    .stat-card {
      background: #f1f5f9;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #3b82f6;
      margin-bottom: 4px;
    }
    .stat-label {
      color: #64748b;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .entry-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e2e8f0;
    }
    .badge {
      display: inline-block;
      background: #3b82f6;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 13px;
    }
    .entry-section {
      margin-bottom: 16px;
      padding: 12px;
      background: white;
      border-radius: 6px;
    }
    .entry-section.warning {
      background: #fef2f2;
      border-left: 3px solid #ef4444;
    }
    ul {
      margin: 8px 0;
      padding-left: 24px;
    }
    li {
      margin: 6px 0;
      color: #475569;
    }
    .tattoo-age {
      color: #64748b;
      font-size: 14px;
      margin-top: 8px;
      font-weight: 600;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 14px;
    }
    .print-button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 20px;
    }
    .print-button:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <div class="report-container">
    <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>
    
    <h1>Complete Healing Journey Report</h1>
    
    <div class="summary-stats">
      <div class="stat-card">
        <div class="stat-value">${entries.length}</div>
        <div class="stat-label">Total Analyses</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${entries[0]?.healing_stage || 'N/A'}</div>
        <div class="stat-label">Current Stage</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${dateRange}</div>
        <div class="stat-label">Date Range</div>
      </div>
    </div>

    <h2>Analysis History</h2>
    
    ${entriesHtml}

    <div class="footer">
      <p>This complete report was generated from your HealAid healing tracker.</p>
      <p>For medical concerns, please consult a healthcare professional.</p>
    </div>
  </div>
</body>
</html>
  `;
};

const generateEmptyReport = (): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>No Healing Data Available</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f8fafc;
    }
    .message {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="message">
    <h1>No Healing Data Available</h1>
    <p>Start your healing journey by uploading your first analysis.</p>
  </div>
</body>
</html>
  `;
};

/**
 * Downloads an HTML string as a file
 */
export const downloadHtmlReport = (html: string, filename: string) => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
