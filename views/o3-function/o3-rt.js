function renderTable() {
  const tbody = document.querySelector('#residentTable tbody');
  const entryInfo = document.getElementById('entryInfo');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
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
}

