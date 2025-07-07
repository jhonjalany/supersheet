function createFilterCell(col) {
  const th = document.createElement('th');
  if (col === 'No.') {
    th.innerHTML = `<div class="th-content"><span></span></div>`;
    return th;
  }
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'filter-input no-print';
  input.dataset.column = col;
  input.placeholder = 'Search';
  input.oninput = () => {
    if (isEditing) disableEditing();
    setupFilters();
  };
  th.appendChild(input);
  return th;
}