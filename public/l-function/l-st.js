function sortTable(column) {
  if (isEditing) disableEditing();
  if (column === 'No.') return;

  // Toggle sort direction
  if (sortColumn === column) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = column;
    sortDirection = 'asc';
  }

  // Update UI indicators
  updateSortIndicators();

  // Determine type of sorting: numeric or string
  const isNumericColumn = filteredData.every(row => {
    const value = row[column] || '';
    // Remove common non-numeric characters and check if it's a number
    const cleaned = value.toString().replace(/[^0-9.-]/g, '');
    return cleaned === '' || !isNaN(parseFloat(cleaned)) && isFinite(cleaned);
  });

  // Perform sort based on detected type
  filteredData.sort((a, b) => {
    let valA = a[column] || '';
    let valB = b[column] || '';

    if (isNumericColumn) {
      // Numeric sort
      valA = parseFloat(valA.toString().replace(/[^0-9.-]/g, ''));
      valB = parseFloat(valB.toString().replace(/[^0-9.-]/g, ''));
      if (isNaN(valA)) valA = -Infinity;
      if (isNaN(valB)) valB = -Infinity;
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    } else {
      // String sort
      valA = valA.toString().toLowerCase();
      valB = valB.toString().toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    }
  });

  currentPage = 1;
  renderTable();
}


