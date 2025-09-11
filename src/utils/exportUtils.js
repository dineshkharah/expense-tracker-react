import dayjs from "dayjs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportCSV = (transactions) => {
    const headers = ["Date", "Type", "Source", "Category", "Amount", "Notes"];
    const rows = transactions.map(t => [
        dayjs(t.date).format("DD-MM-YYYY"),
        t.type,
        t.source,
        t.category,
        t.amount,
        t.notes || ""
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "transactions.csv");
};

export const exportPDF = (transactions) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Transactions Report", 14, 15);

    const tableColumn = ["Date", "Type", "Source", "Category", "Amount", "Notes"];
    const tableRows = transactions.map(t => [
        dayjs(t.date).format("DD-MM-YYYY"),
        t.type,
        t.source,
        t.category,
        t.amount,
        t.notes || ""
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 25,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save("transactions.pdf");
};
