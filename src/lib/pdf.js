import { jsPDF } from "jspdf";

const MARGIN = 18;

/**
 * Renders a lightweight markdown body into a real, paginated PDF and saves it.
 */
export function downloadPdf(title, body) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - MARGIN * 2;
  let y = MARGIN;
  let page = 1;

  const paintFooter = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(160);
    doc.text(String(page), pageW / 2, pageH - 9, { align: "center" });
  };

  const newPage = () => {
    paintFooter();
    doc.addPage();
    page += 1;
    y = MARGIN;
  };

  const ensure = (need) => {
    if (y + need > pageH - 18) newPage();
  };

  const inline = (value) =>
    value
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(20);
  doc.splitTextToSize(title, maxW).forEach((line) => {
    ensure(9);
    doc.text(line, MARGIN, y);
    y += 8.6;
  });

  y += 1.5;
  doc.setDrawColor(214);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, pageW - MARGIN, y);
  y += 8;

  body.split("\n").forEach((raw) => {
    const trimmed = raw.trim();

    if (!trimmed) {
      y += 2.4;
      return;
    }

    if (/^-{3,}$/.test(trimmed)) {
      ensure(7);
      doc.setDrawColor(226);
      doc.setLineWidth(0.2);
      doc.line(MARGIN, y, pageW - MARGIN, y);
      y += 6.5;
      return;
    }

    let size = 10.5;
    let weight = "normal";
    let indent = 0;
    let prefix = "";
    let color = 38;
    let gapBefore = 0;
    let text = trimmed;

    if (/^#\s+/.test(trimmed)) {
      size = 14.5;
      weight = "bold";
      text = trimmed.replace(/^#\s+/, "");
      gapBefore = 5;
      color = 15;
    } else if (/^##\s+/.test(trimmed)) {
      size = 12;
      weight = "bold";
      text = trimmed.replace(/^##\s+/, "");
      gapBefore = 4.5;
      color = 15;
    } else if (/^###\s+/.test(trimmed)) {
      size = 10.8;
      weight = "bold";
      text = trimmed.replace(/^###\s+/, "");
      gapBefore = 3;
      color = 20;
    } else if (/^[-*]\s+/.test(trimmed)) {
      text = trimmed.replace(/^[-*]\s+/, "");
      prefix = "\u2022  ";
      indent = 4;
    } else if (/^>\s+/.test(trimmed)) {
      text = trimmed.replace(/^>\s+/, "");
      weight = "italic";
      indent = 4;
      color = 70;
    } else if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+\.)\s+/);
      prefix = match[1] + "  ";
      text = trimmed.slice(match[0].length);
      indent = 4;
    }

    y += gapBefore;

    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    doc.setTextColor(color);

    const lineHeight = size * 0.55;
    const lines = doc.splitTextToSize(prefix + inline(text), maxW - indent);

    lines.forEach((line) => {
      ensure(lineHeight + 1);
      doc.text(line, MARGIN + indent, y);
      y += lineHeight;
    });

    y += size > 11 ? 2.2 : 0.7;
  });

  paintFooter();

  const fileName = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  doc.save(`${fileName}.pdf`);
}