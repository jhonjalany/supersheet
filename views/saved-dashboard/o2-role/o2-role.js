


function renderTable() {
  document.querySelectorAll('#residentTable tbody tr').forEach(r => r.classList.remove('row-selected'));
  const tbody = document.querySelector('#residentTable tbody');
  const entryInfo = document.getElementById('entryInfo');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  document.querySelectorAll('[id^="result-"]').forEach(el => el.textContent = '');
  tbody.innerHTML = '';
  const start = (currentPage - 1) * pageSize;
  const pageData = filteredData.slice(start, start + pageSize);
  pageData.forEach((item, index) => {
    const row = document.createElement('tr');
    let html = `<td>${start + index + 1}</td>`;
    visibleColumns.slice(1).forEach(col => {
      html += `<td>${item[col] || ''}</td>`;
    });
    row.innerHTML = html;

// Apply conditional formatting
const currentSheet = document.getElementById('sheetSelector').value;
const rules = conditionalFormatting[currentSheet] || [];

rules.forEach(rule => {
  const { column, condition, value, color } = rule;
  const cellIndex = visibleColumns.slice(1).indexOf(column) + 1; // +1 because No. is index 0
  if (cellIndex === -1 + 1) return;

  const cell = row.cells[cellIndex];
  const cellText = cell.innerText.trim();

  let match = false;

  switch (condition) {
    case 'greater':
      match = parseFloat(cellText) > parseFloat(value);
      break;
    case 'less':
      match = parseFloat(cellText) < parseFloat(value);
      break;
    case 'equal':
      match = cellText === value;
      break;
    case 'contains':
      match = cellText.includes(value);
      break;
    case 'today':
      const today = new Date().toISOString().split('T')[0];
      match = cellText === today;
      break;
  }

  if (match) {
    cell.style.backgroundColor = color;
  }
});
    // Add click event to highlight the selected row
row.addEventListener('click', () => {
  // Remove 'row-selected' from all rows
  document.querySelectorAll('#residentTable tbody tr').forEach(r => {
    r.classList.remove('row-selected');
  });
  // Add 'row-selected' to the clicked row
  row.classList.add('row-selected');
});

let longPressTimer;
row.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  showDeleteMenu(e, item[idColumn], index);
});
row.addEventListener('touchstart', (e) => {
  longPressTimer = setTimeout(() => {
    e.preventDefault();
    showDeleteMenu(e, item[idColumn], index);
  }, 800);
});
row.addEventListener('touchend', () => clearTimeout(longPressTimer));
tbody.appendChild(row);
  });
  const end = Math.min(start + pageSize, filteredData.length);
  entryInfo.textContent = `Showing ${start + 1} to ${end} of ${filteredData.length} entries`;
  const totalPages = Math.ceil(filteredData.length / pageSize);
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  updateChartOptions(); // Call this after updating headers/columns
}

function goToPage(page) {
  if (isEditing) disableEditing();
  const totalPages = Math.ceil(filteredData.length / pageSize);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTable();
}

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




