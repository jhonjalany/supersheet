

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

  updateSortIndicators();

  const sampleValues = filteredData.map(row => row[column]);

  // Determine if the column is numeric, string, or mixed
  const isNumeric = sampleValues.every(val => {
    const strVal = String(val).trim();
    return strVal === '' || !isNaN(strVal);
  });

  const isString = sampleValues.every(val => {
    const strVal = String(val).trim();
    return isNaN(strVal);
  });

  let sortType = 'mixed';
  if (isNumeric) sortType = 'numeric';
  else if (isString) sortType = 'string';

  // Sort based on detected type
  filteredData.sort((a, b) => {
    let valA = a[column];
    let valB = b[column];

    if (sortType === 'numeric') {
      valA = parseFloat(String(valA).trim()) || -Infinity;
      valB = parseFloat(String(valB).trim()) || -Infinity;
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    } else if (sortType === 'string') {
      valA = String(valA).toLowerCase().trim();
      valB = String(valB).toLowerCase().trim();
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      // Mixed: Try parsing as number, fallback to string comparison
      const numA = parseFloat(String(valA).replace(/[^0-9.-]/g, ''));
      const numB = parseFloat(String(valB).replace(/[^0-9.-]/g, ''));
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      } else {
        valA = String(valA).toLowerCase().trim();
        valB = String(valB).toLowerCase().trim();
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
    }
  });

  currentPage = 1;
  renderTable();
}

function updateSortIndicators() {
  document.querySelectorAll('.sort-indicator').forEach(el => el.textContent = '');
  const indicator = document.getElementById(`indicator-${sortColumn}`);
  if (indicator) {
    indicator.textContent = sortDirection === 'asc' ? ' ↑' : ' ↓';
  }
}



