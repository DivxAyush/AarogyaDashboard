import * as XLSX from "xlsx";

export const exportToExcel = (data, columns, sheetName = "Sheet1", fileName = "export") => {
  if (!data?.length || !columns?.length) return;

  const wsData = [
    columns.map((c) => c.label),
    ...data.map((row) => columns.map((c) => row[c.id] ?? "")),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
};
