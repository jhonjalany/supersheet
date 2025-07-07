function exportToCSV() {
  const csvRows = [];
  
  // Header Row
  const headers = visibleColumns.slice(1); // skip 'No.'
  csvRows.push(headers.join(','));

  // Data Rows
  filteredData.forEach(row => {
    const values = headers.map(col => `"${row[col] || ''}"`);
    csvRows.push(values.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'ResidentData.csv';
  a.click();
  URL.revokeObjectURL(url);
}
document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);