
document.querySelectorAll('#addColumnModal .modal-close').forEach(el => {
  el.addEventListener('click', () => {
    document.getElementById('addColumnModal').style.display = 'none';
  });
});

document.getElementById('columnFormula').addEventListener('input', renderFormulaSamples);


// Handle Add Sheet Button
document.getElementById('addSheetBtn').addEventListener('click', () => {
  document.getElementById('addSheetModal').style.display = 'block';
});

// Close modal on click
document.querySelectorAll('#addSheetModal .modal-close').forEach(el => {
  el.addEventListener('click', () => {
    document.getElementById('addSheetModal').style.display = 'none';
  });
});

// Add more column fields
document.getElementById('addMoreColBtn').addEventListener('click', () => {
  const container = document.getElementById('sheetColumnInputs');
  const group = document.createElement('div');
  group.className = 'form-group';
  group.innerHTML = `
    <input type="text" class="column-name-input" placeholder="Enter column name" required />
  `;
  container.appendChild(group);
});

// Submit form to create new sheet
// Submit form to create new sheet
document.getElementById('addSheetForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const inputs = document.querySelectorAll('.column-name-input');
  const columns = Array.from(inputs).map(i => i.value.trim()).filter(c => c !== '');
  if (columns.length === 0) {
    alert("Please enter at least one column name.");
    return;
  }
  // Create new sheet
  const sheetName = prompt("Enter sheet name:", "Sheet" + (Object.keys(sheetDataMap).length + 1));
  if (!sheetName || sheetName.trim() === '') {
    alert("Sheet name cannot be empty.");
    return;
  }
  // Ensure unique sheet name
  let uniqueSheetName = sheetName;
  let counter = 1;
  while (sheetDataMap[uniqueSheetName]) {
    uniqueSheetName = `${sheetName}_${counter++}`;
  }

  // Generate empty rows for the new sheet
  const newRow = {};
  columns.forEach(col => newRow[col] = '');

  // Add new sheet to sheetDataMap
  sheetDataMap[uniqueSheetName] = [newRow];

  // Ensure ID field exists
  newRow.ID = newRow.ID || `temp-${Date.now()}`;

  // Set residentData and filteredData to the new sheet's data
  residentData = ensureUniqueID([...sheetDataMap[uniqueSheetName]]);
  filteredData = [...residentData];

  // Save to localStorage
  saveToLocalStorage();

  // Reload current sheet or switch to the new one
  loadSheetData(uniqueSheetName);

  // Update sheet selector dropdown
  const sheetSelector = document.getElementById('sheetSelector');
  sheetSelector.innerHTML = '';
  Object.keys(sheetDataMap).forEach(sheetName => {
    const option = document.createElement('option');
    option.value = sheetName;
    option.textContent = sheetName;
    sheetSelector.appendChild(option);
  });
  sheetSelector.value = uniqueSheetName;

  // Trigger change to refresh table
  sheetSelector.onchange();

  // Hide modal and reset form
  document.getElementById('addSheetModal').style.display = 'none';
  document.getElementById('sheetColumnInputs').innerHTML = `
    <div class="form-group">
      <label>Column Name</label>
      <input type="text" class="column-name-input" placeholder="Enter column name" required />
    </div>
  `;
});

function openConditionalFormatModal() {
  const currentSheet = document.getElementById('sheetSelector').value;
  const sampleRow = sheetDataMap[currentSheet]?.[0] || {};
  const colNames = Object.keys(sampleRow).filter(k => k !== 'Row Number');

  const cfColumn = document.getElementById('cfColumn');
  cfColumn.innerHTML = '';
  colNames.forEach(col => {
    const option = document.createElement('option');
    option.value = col;
    option.textContent = col;
    cfColumn.appendChild(option);
  });

  document.getElementById('conditionalFormatModal').style.display = 'block';
}


