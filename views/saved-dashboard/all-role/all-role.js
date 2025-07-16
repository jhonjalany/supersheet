



let sheetDataMap = {}; // { "Sheet1": [...], "Sheet2": [...] }
let residentData = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 10;
const visibleColumns = ['No.'];
const optionalColumns = [];
let sortColumn = null;
let sortDirection = 'asc';
let fixedSecondColumn = '';
let lastAddedColumnIndex = 1;
let isEditing = false;
let idColumn = 'ID'; // Will be set dynamically
// For Delete Functionality
let selectedRowForDelete = null;
let selectedRowIndex = -1;
let editedCells = {}; // <-- Add this
let conditionalFormatting = {}; // { "Sheet1": [rules], "Sheet2": [...] }
const dropdownColumns = {}; // { "Sheet1": { "Status": ["Active", "Inactive"], ... }, ... }

function ensureUniqueID(data, idField = 'ID') {
  const seenIDs = {};
  return data.map(item => {
    let id = item[idField];
    if (!id || seenIDs[id]) {
      let counter = 1;
      while (seenIDs[`${id}_${counter}`]) counter++;
      id = `${id || 'temp'}_${counter}`;
    }
    seenIDs[id] = true;
    item[idField] = id;
    return item;
  });
}


document.getElementById('addRowBtn').addEventListener('click', () => {
  openAddRowModal();
});

document.getElementById('exportPdfBtn').addEventListener('click', () => {
  document.getElementById('pdfOptionsModal').style.display = 'block';
});

document.getElementById('pdfStyleForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const fontSize = parseInt(document.getElementById('fontSize').value);
  const fontColor = document.getElementById('fontColor').value;
  const bgColor = document.getElementById('bgColor').value;
  const orientation = document.getElementById('orientation').value;

  const tableContainer = document.querySelector('.table-container');
  const originalStyles = {
    color: tableContainer.style.color,
    backgroundColor: tableContainer.style.backgroundColor,
    fontSize: tableContainer.style.fontSize,
  };

  // Apply custom styles temporarily
  tableContainer.style.color = fontColor;
  tableContainer.style.backgroundColor = bgColor;
  tableContainer.querySelectorAll('table, th, td').forEach(el => {
    el.style.fontSize = fontSize + 'px';
  });

  // Hide UI elements during export
  const actionButtons = document.querySelectorAll('.no-print');
  actionButtons.forEach(btn => btn.style.display = 'none');

  // Use html2canvas to capture styled table
  html2canvas(tableContainer).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });

    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save("ResidentData.pdf");

    // Restore original styles
    tableContainer.style.color = originalStyles.color;
    tableContainer.style.backgroundColor = originalStyles.backgroundColor;
    tableContainer.querySelectorAll('table, th, td').forEach(el => {
      el.style.fontSize = originalStyles.fontSize;
    });
    actionButtons.forEach(btn => btn.style.display = '');
    document.getElementById('pdfOptionsModal').style.display = 'none';
  });
});

// Close modal on cancel or click outside
document.getElementById('cancelPdfBtn')?.addEventListener('click', () => {
  document.getElementById('pdfOptionsModal').style.display = 'none';
});
document.querySelectorAll('#pdfOptionsModal .modal-close').forEach(el => {
  el.addEventListener('click', () => {
    document.getElementById('pdfOptionsModal').style.display = 'none';
  });
});

document.getElementById('addDropdownColumnBtn').addEventListener('click', () => {
  document.getElementById('dropdownOptionsContainer').innerHTML = `
    <div class="form-group">
      <label>Dropdown Option</label>
      <input type="text" class="dropdown-option-input" placeholder="Option 1" required />
    </div>
  `;
  document.getElementById('addDropdownColumnModal').style.display = 'block';
});

document.getElementById('addMoreOptionBtn').addEventListener('click', () => {
  const container = document.getElementById('dropdownOptionsContainer');
  const count = container.querySelectorAll('.form-group').length + 1;
  const group = document.createElement('div');
  group.className = 'form-group';
  group.innerHTML = `
    <label>Dropdown Option</label>
    <input type="text" class="dropdown-option-input" placeholder="Option ${count}" required />
  `;
  container.appendChild(group);
});


document.getElementById('addDropdownColumnForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const colName = document.getElementById('dropdownColumnName').value.trim();
  const optionsInputs = document.querySelectorAll('.dropdown-option-input');
  const options = Array.from(optionsInputs).map(i => i.value.trim()).filter(v => v !== '');

  if (!colName || options.length === 0) {
    alert("Please enter a column name and at least one dropdown option.");
    return;
  }

  if (visibleColumns.includes(colName)) {
    alert("This column already exists!");
    return;
  }

  visibleColumns.splice(visibleColumns.length - 1, 0, colName);
  optionalColumns.push(colName);

  const currentSheet = document.getElementById('sheetSelector').value;

  // Initialize dropdown columns map
  if (!dropdownColumns[currentSheet]) dropdownColumns[currentSheet] = {};
  dropdownColumns[currentSheet][colName] = options;

  // Apply default value to all rows
  filteredData.forEach(row => row[colName] = options[0]);
  residentData.forEach(row => row[colName] = options[0]);
  sheetDataMap[currentSheet].forEach(row => row[colName] = options[0]);

  initTable(); // Rebuild UI
  saveToLocalStorage();
  document.getElementById('addDropdownColumnModal').style.display = 'none';
  alert(`New dropdown column "${colName}" added.`);
});

document.getElementById('cancelDropdownColBtn')?.addEventListener('click', () => {
  document.getElementById('addDropdownColumnModal').style.display = 'none';
});

document.querySelectorAll('#addDropdownColumnModal .modal-close').forEach(el => {
  el.addEventListener('click', () => {
    document.getElementById('addDropdownColumnModal').style.display = 'none';
  });
});

function openAddRowModal() {
  const currentSheet = document.getElementById('sheetSelector').value;
  const sampleRow = sheetDataMap[currentSheet][0] || {};
  const colNames = Object.keys(sampleRow).filter(k => k !== 'Row Number');
  const modal = document.getElementById('addRowModal');
  const form = document.getElementById('addRowForm');
  form.innerHTML = ''; // Clear previous content

  if (!colNames.length) {
    alert("No column structure found.");
    return;
  }

  colNames.forEach(col => {
    const group = document.createElement('div');
    group.className = 'form-group';
    const label = document.createElement('label');
    label.textContent = col;
    const input = document.createElement('input');
    input.type = 'text';
    input.name = col;
    input.placeholder = `Enter ${col}`;
    input.required = col === idColumn ? true : false;
    group.appendChild(label);
    group.appendChild(input);
    form.appendChild(group);
  });

  modal.style.display = 'block';
}

document.querySelector('.modal-close')?.addEventListener('click', () => {
  document.getElementById('addRowModal').style.display = 'none';
});

document.getElementById('addRowForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const currentSheet = document.getElementById('sheetSelector').value;
  const sampleRow = sheetDataMap[currentSheet][0] || {};
  
  // Only get real columns from current sheet
  const colNames = Object.keys(sampleRow).filter(k => k !== 'Row Number');
  
  const formData = {};
  const inputs = this.querySelectorAll('input');

  inputs.forEach(input => {
    const col = input.name;
    if (colNames.includes(col)) { // Only add if column exists in current sheet
      formData[col] = input.value.trim();
    }
  });

  const existingIds = new Set([
    ...residentData.map(r => r[idColumn]),
    ...filteredData.map(r => r[idColumn])
  ]);

  if (existingIds.has(formData[idColumn])) {
    alert("A row with this ID already exists!");
    return;
  }

  // Evaluate formula columns only for current sheet
  const sheetFormulas = window.sheetFormulas?.[currentSheet] || {};
  Object.keys(sheetFormulas).forEach(colName => {
    const formula = sheetFormulas[colName];
    try {
      formData[colName] = evaluateFormula(formula, formData);
    } catch (e) {
      formData[colName] = 'Error';
    }
  });

  residentData.push(formData);
  filteredData.push(formData);
  sheetDataMap[currentSheet].push(formData);

  document.getElementById('addRowModal').style.display = 'none';
  renderTable();
  saveToLocalStorage();
  alert('New row added successfully.');
});

function initTable() {
  const headerRow = document.getElementById('headerRow');
  const filterRow = document.getElementById('filterRow');
  const summaryRow = document.getElementById('summaryRow');

  headerRow.innerHTML = '';
  filterRow.innerHTML = '';
  summaryRow.innerHTML = '';

  visibleColumns.forEach((col, index) => {
    const th = createHeaderCell(col);
    headerRow.appendChild(th);

    const ft = createFilterCell(col);
    filterRow.appendChild(ft);

    // Summary cell
    const sf = document.createElement('td');
    if (index === 0) {
      sf.textContent = 'Totals:';
      sf.style.fontWeight = 'bold';
    } else {
      sf.innerHTML = `
        <td>
  <div style="display:flex; flex-direction:column; gap:4px; font-size:12px;" class="no-print" >
    <div style="display:flex; align-items:center; gap:6px;">
      <strong>Sum:</strong>
      <button onclick='calculateColumnSummary("${col}", "sum")' class="action-btn no-print" style="font-size:20px; padding:2px 6px; background-color: #3498db;">Calculate</button>
    </div>
    <div style="display:flex; align-items:center; gap:6px;">
      <strong>Avg:</strong>
      <button onclick='calculateColumnSummary("${col}", "avg")' class="action-btn no-print" style="font-size:20px; padding:2px 6px; background-color: #9b59b6;">Calculate</button>
    </div>
    <div id="result-${col}" style="margin-top:4px; font-weight:bold; color:#2c3e50; font-size:20px;"></div>
  </div>
</td>`;
    }
    summaryRow.appendChild(sf);
  });

  const addTh = document.createElement('th');
  const addButton = document.createElement('button');
  addButton.textContent = '+';
  addButton.className = 'add-col-btn no-print';
  addButton.onclick = () => showAddColumnInput(addTh);
  addTh.appendChild(addButton);
  headerRow.appendChild(addTh);
  const ft = document.createElement('th');
  filterRow.appendChild(ft);

  enableColumnReordering();
  renderTable(); // Re-render after updating layout
  updateChartOptions(); // Call this after updating headers/columns
}

function calculateColumnSummary(columnName, type = 'sum') {
  const values = filteredData
    .map(row => parseFloat(row[columnName]))
    .filter(val => !isNaN(val));

  const total = values.reduce((acc, val) => acc + val, 0);
  const count = values.length;
  const resultSpan = document.getElementById(`result-${columnName}`);
  let output = '';

  if (type === 'sum') {
    output = `Total: ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (type === 'avg' && count > 0) {
    const avg = total / count;
    output = `Average: ${avg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    output = `N/A`;
  }

  resultSpan.textContent = output;
}

function createHeaderCell(col) {
  const th = document.createElement('th');
  if (col === 'No.') {
    th.innerHTML = `<div class="th-content"><span>No.</span></div>`;
    return th;
  }
  const div = document.createElement('div');
  div.className = 'th-content';
  if (!['No.', idColumn, fixedSecondColumn].includes(col)) {
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.className = 'remove-col-btn no-print';
    removeBtn.title = 'Remove Column';
    removeBtn.onclick = () => removeColumn(col);
    div.appendChild(removeBtn);
  }
  const span = document.createElement('span');
  span.textContent = col;
  const indicator = document.createElement('span');
  indicator.className = 'sort-indicator';
  indicator.id = `indicator-${col}`;
  div.appendChild(span);
  div.appendChild(indicator);
  th.appendChild(div);
  th.onclick = () => sortTable(col);
  return th;
}

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

