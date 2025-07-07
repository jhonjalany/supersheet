function setupFilters() {
  const inputs = document.querySelectorAll('.filter-input');
  const filters = {};
  inputs.forEach(i => {
    const col = i.getAttribute('data-column');
    const val = i.value.toLowerCase().trim();
    if (val) filters[col] = val;
  });
  filteredData = residentData.filter(item => {
    return Object.entries(filters).every(([col, val]) => {
      let cellText = item[col]?.toString().toLowerCase() || '';
      return cellText.includes(val.toLowerCase());
    });
  });
  currentPage = 1;
  sortColumn = null;
  sortDirection = 'asc';
  renderTable();
}
