

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

function removeColumn(column) {
  if ([idColumn, fixedSecondColumn].includes(column)) return;
  const idx = visibleColumns.indexOf(column);
  if (idx > -1) {
    visibleColumns.splice(idx, 1);
    const fixedIndex = visibleColumns.indexOf(fixedSecondColumn);
    if (fixedIndex !== -1 && fixedIndex < visibleColumns.length - 1) {
      lastAddedColumnIndex = visibleColumns.length - 1;
    } else {
      lastAddedColumnIndex = fixedIndex;
    }
    initTable();
  }
}

function showAddColumnInput(cell) {
  cell.innerHTML = '';
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '8px';
  const select = document.createElement('select');
  const remaining = optionalColumns.filter(c => !visibleColumns.includes(c) && c !== idColumn && c !== fixedSecondColumn);
  remaining.forEach(col => {
    const option = document.createElement('option');
    option.value = col;
    option.textContent = col;
    select.appendChild(option);
  });
  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add';
  addBtn.className = 'add-col-btn';
  addBtn.onclick = () => {
    if (isEditing) disableEditing();
    const selectedCol = select.value;
    if (!visibleColumns.includes(selectedCol)) {
      const fixedIndex = visibleColumns.indexOf(fixedSecondColumn);
      const insertAfterIndex = lastAddedColumnIndex === 1 ? fixedIndex : lastAddedColumnIndex;
      visibleColumns.splice(insertAfterIndex + 1, 0, selectedCol);
      lastAddedColumnIndex = insertAfterIndex + 1;
      initTable();
    }
  };
  container.appendChild(select);
  container.appendChild(addBtn);
  cell.appendChild(container);
}

