import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const exportToExcel = (data: any[], fileName: string) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPDF = (
  title: string,
  columns: string[],
  data: any[][],
  fileName: string
) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

  autoTable(doc, {
    startY: 40,
    head: [columns],
    body: data,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
  });

  doc.save(`${fileName}.pdf`);
};
