


  function exportToCSV() {
  const csvRows = [];
  
  // Header Row
  const headers = visibleColumns.slice(1); // skip 'No.'
  csvRows.push(headers.join(','));

  // Data Rows
  filteredData.forEach(row => {
    const values = headers.map(col => `"${row[col] || ''}"`);
    csvRows.push(values.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'ResidentData.csv';
  a.click();
  URL.revokeObjectURL(url);
}

  document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV); 

  document.getElementById('clearLocalStorageBtn').addEventListener('click', () => {
  if (confirm("Are you sure you want to delete all saved data from this browser?")) {
    localStorage.removeItem('residentData');
    localStorage.removeItem('sheetDataMap');
    localStorage.removeItem('currentSheet');
    alert("Saved data cleared from local storage.");
    location.reload(); // Reload the page to reset everything
  }
});

document.getElementById('addColumnFormulaBtn').addEventListener('click', () => {
  openAddColumnModal();
});

function openAddColumnModal() {
  const currentSheet = document.getElementById('sheetSelector').value;
  const sampleRow = sheetDataMap[currentSheet][0] || {};
  const colNames = Object.keys(sampleRow).filter(k => k !== 'Row Number');

  // Populate column names into help text
  const formulaInput = document.getElementById('columnFormula');
  formulaInput.placeholder = `e.g. ${colNames[0]} + ${colNames[1]}`;
  document.querySelector('#addColumnForm small').textContent =
    'Available columns: ' + colNames.join(', ');

  document.getElementById('columnName').value = '';
  document.getElementById('columnFormula').value = '';
  document.getElementById('sampleOutput').innerHTML = '';

  document.getElementById('addColumnModal').style.display = 'block';

  renderFormulaSamples(); // Initial empty samples
}

function renderFormulaSamples() {
  const formula = document.getElementById('columnFormula').value.trim();
  const ul = document.getElementById('sampleOutput');
  ul.innerHTML = '';
  if (!formula) return;
  const sampleRows = filteredData.slice(0, 10);
  sampleRows.forEach((row, index) => {
    try {
      const result = evaluateFormula(formula, row);
      ul.innerHTML += `<li><strong>Row ${index + 1}:</strong> ${result}</li>`;
    } catch (e) {
      ul.innerHTML += `<li><strong>Row ${index + 1}:</strong> Invalid formula</li>`;
    }
  });
}


//----------------------------------------------advance search-----------------

function evaluateCondition(expr, row) {
  // Replace logical keywords with JS operators
  expr = expr.replace(/\bAND\b/g, '&&').replace(/\bOR\b/g, '||');

  const safeExpr = expr.replace(/([a-zA-Z_][a-zA-Z0-9_]*)/g, match => {
    const val = row[match];
    if (typeof val === 'string') {
      return `"${val}"`;
    }
    return isNaN(val) ? `"${val}"` : parseFloat(val);
  });

  try {
    return Function('"use strict";return (' + safeExpr + ')')();
  } catch (e) {
    throw new Error("Error evaluating condition: " + e.message);
  }
}






document.getElementById('advancedSearchBtn').addEventListener('click', function () {
  if (isEditing) disableEditing();
  const expr = document.getElementById('advancedFilterInput').value.trim();
  if (!expr) {
    alert("Please enter a valid condition.");
    return;
  }
  try {
    // Apply filter
    filteredData = residentData.filter(row => evaluateCondition(expr, row));
    currentPage = 1;
    renderTable();
  } catch (e) {
    alert("Invalid expression: " + e.message);
  }
});

document.getElementById('resetAdvancedFilterBtn').addEventListener('click', function () {
  document.getElementById('advancedFilterInput').value = '';
  filteredData = [...residentData];
  currentPage = 1;
  sortColumn = null;
  sortDirection = 'asc';
  renderTable();
});





