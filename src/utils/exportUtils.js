import dayjs from "dayjs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportCSV = (transactions) => {
  const headers = ["Date", "Type", "Source", "Category", "Amount", "Notes"];
  const rows = transactions.map((t) => [
    dayjs(t.date).format("DD-MM-YYYY"),
    t.type,
    t.source,
    t.category,
    t.amount,
    t.notes || "",
  ]);

  const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "transactions.csv");
};

export const exportPDF = ({
  transactions,
  summary,
  chartImage,
  options,
  month,
}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 15;

  //  Header
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Expense Tracker", 14, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Report for ${month || "All Time"}`, 14, 20);
  doc.text(
    `Generated: ${dayjs().format("DD MMM YYYY, hh:mm A")}`,
    pageWidth - 14,
    20,
    { align: "right" },
  );

  currentY = 38;

  //  Summary Section
  if (options.summary && summary) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 14, currentY);
    currentY += 8;

    const boxWidth = (pageWidth - 42) / 3;
    const boxHeight = 22;

    // Income box
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(14, currentY, boxWidth, boxHeight, 3, 3, "F");
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Total Income", 14 + boxWidth / 2, currentY + 7, {
      align: "center",
    });
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Rs. ${parseFloat(summary.totalIncome).toLocaleString()}`,
      14 + boxWidth / 2,
      currentY + 16,
      { align: "center" },
    );

    // Expenses box
    const box2X = 14 + boxWidth + 7;
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(box2X, currentY, boxWidth, boxHeight, 3, 3, "F");
    doc.setTextColor(153, 27, 27);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Total Expenses", box2X + boxWidth / 2, currentY + 7, {
      align: "center",
    });
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Rs. ${parseFloat(summary.totalExpenses).toLocaleString()}`,
      box2X + boxWidth / 2,
      currentY + 16,
      { align: "center" },
    );

    // Net box
    const box3X = 14 + (boxWidth + 7) * 2;
    const netPositive = summary.net >= 0;
    doc.setFillColor(
      netPositive ? 224 : 254,
      netPositive ? 242 : 249,
      netPositive ? 254 : 195,
    );
    doc.roundedRect(box3X, currentY, boxWidth, boxHeight, 3, 3, "F");
    doc.setTextColor(
      netPositive ? 29 : 133,
      netPositive ? 78 : 77,
      netPositive ? 216 : 14,
    );
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Net", box3X + boxWidth / 2, currentY + 7, { align: "center" });
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${netPositive ? "+" : ""}Rs. ${parseFloat(summary.net).toLocaleString()}`,
      box3X + boxWidth / 2,
      currentY + 16,
      { align: "center" },
    );

    currentY += boxHeight + 12;
  }

  //  Chart Section
  if (options.charts && chartImage) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Charts", 14, currentY);
    currentY += 6;

    const chartWidth = pageWidth - 28;
    const chartHeight = 70;
    doc.addImage(chartImage, "PNG", 14, currentY, chartWidth, chartHeight);
    currentY += chartHeight + 10;
  }

  //  Transactions Table
  if (options.table) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Transactions", 14, currentY);
    currentY += 4;

    const tableRows = transactions.map((t) => [
      dayjs(t.date).format("DD-MM-YYYY"),
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      t.source,
      t.category,
      `Rs. ${parseFloat(t.amount).toLocaleString()}`,
      t.notes || "-",
    ]);

    autoTable(doc, {
      head: [["Date", "Type", "Source", "Category", "Amount", "Notes"]],
      body: tableRows,
      startY: currentY,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 25 },
        4: {
          textColor: (cell) =>
            cell.raw.includes("-") ? [239, 68, 68] : [34, 197, 94],
        },
      },
    });
  }

  //  Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 8,
      { align: "right" },
    );
    doc.text(
      "Expense Tracker — Confidential",
      14,
      doc.internal.pageSize.getHeight() - 8,
    );
  }

  doc.save(`report-${month || "all"}-${dayjs().format("DDMMYYYY")}.pdf`);
};
