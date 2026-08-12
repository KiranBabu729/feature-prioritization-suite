import { jsPDF } from "jspdf";

export function exportReportPDF({ features, tierBreakdown, sentiment, quadrants }) {
  const doc = new jsPDF();
  const marginX = 14;
  let y = 18;

  doc.setFontSize(18);
  doc.setTextColor(31, 41, 55);
  doc.text("Feature Prioritization & Roadmap Report", marginX, y);
  y += 6;
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(new Date().toLocaleDateString(), marginX, y);
  y += 10;

  doc.setFontSize(13);
  doc.setTextColor(0, 146, 188);
  doc.text("Executive Summary", marginX, y);
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  const summaryLines = doc.splitTextToSize(
    `Tracking ${features.length} features across ${new Set(features.map((f) => f.clientName)).size} clients. ` +
      `${features.filter((f) => f.status === "In Progress").length} in progress, ` +
      `${features.filter((f) => f.status === "Planned").length} planned, ` +
      `${features.filter((f) => f.status === "Backlog").length} in backlog. ` +
      `Prioritization is weighted by client tier, feedback frequency, and business impact relative to effort.`,
    180,
  );
  doc.text(summaryLines, marginX, y);
  y += summaryLines.length * 5 + 8;

  doc.setFontSize(13);
  doc.setTextColor(0, 146, 188);
  doc.text("Quadrant Breakdown", marginX, y);
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  Object.entries(quadrants).forEach(([label, count]) => {
    doc.text(`${label}: ${count} features`, marginX, y);
    y += 6;
  });
  y += 4;

  doc.setFontSize(13);
  doc.setTextColor(0, 146, 188);
  doc.text("Client Tier Breakdown", marginX, y);
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  tierBreakdown.forEach((t) => {
    doc.text(`${t.tier}: ${t.count} features`, marginX, y);
    y += 6;
  });
  y += 4;

  doc.setFontSize(13);
  doc.setTextColor(0, 146, 188);
  doc.text("Client Sentiment Analysis", marginX, y);
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  Object.entries(sentiment).forEach(([label, count]) => {
    doc.text(`${label}: ${count} features`, marginX, y);
    y += 6;
  });
  y += 6;

  doc.setFontSize(13);
  doc.setTextColor(0, 146, 188);
  doc.text("Top Ranked Features", marginX, y);
  y += 7;
  doc.setFontSize(9);
  doc.setTextColor(31, 41, 55);
  features.slice(0, 12).forEach((f, i) => {
    if (y > 275) {
      doc.addPage();
      y = 18;
    }
    doc.text(
      `${i + 1}. ${f.name} — ${f.clientName} (${f.clientTier}) — score ${f.priorityScore}`,
      marginX,
      y,
    );
    y += 5.5;
  });

  doc.save(`feature-roadmap-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
