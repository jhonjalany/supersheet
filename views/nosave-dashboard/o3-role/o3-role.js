

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


