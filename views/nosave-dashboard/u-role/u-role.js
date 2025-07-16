

async function saveToLocalStorage() {
  const currentSheet = document.getElementById('sheetSelector').value;
  await localforage.setItem('residentData', residentData);
  await localforage.setItem('sheetDataMap', sheetDataMap);
  await localforage.setItem('currentSheet', currentSheet);
  await localforage.setItem('sheetFormulas', window.sheetFormulas || {});
  await localforage.setItem('editedCells', editedCells);
  await localforage.setItem('conditionalFormatting', conditionalFormatting);
  await localforage.setItem('dropdownColumns', dropdownColumns);
}

 async function loadFromLocalStorage() {
  const residentDataStr = await localforage.getItem('residentData');
  const sheetDataMapStr = await localforage.getItem('sheetDataMap');
  const currentSheet = await localforage.getItem('currentSheet');
  const condFormatStr = await localforage.getItem('conditionalFormatting');
  const savedDropdowns = await localforage.getItem('dropdownColumns');

  if (savedDropdowns) Object.assign(dropdownColumns, savedDropdowns);
  if (condFormatStr) conditionalFormatting = condFormatStr;

  if (residentDataStr && sheetDataMapStr) {
    residentData = ensureUniqueID(residentDataStr);
    sheetDataMap = sheetDataMapStr;
    Object.keys(sheetDataMap).forEach(sheet => {
      sheetDataMap[sheet] = ensureUniqueID(sheetDataMap[sheet]);
    });
    filteredData = [...residentData];

    let defaultSheet = currentSheet;
    const sheetNames = Object.keys(sheetDataMap);

    if (!defaultSheet) {
      defaultSheet = sheetNames.length > 1 ? sheetNames[1] : sheetNames[0];
    }

    const savedEdits = await localforage.getItem('editedCells');
    if (savedEdits) {
      editedCells = savedEdits;
      Object.entries(editedCells).forEach(([id, changes]) => {
        residentData.forEach(row => {
          if (row[idColumn] === id) Object.assign(row, changes);
        });
        sheetDataMap[defaultSheet]?.forEach(row => {
          if (row[idColumn] === id) Object.assign(row, changes);
        });
        filteredData.forEach(row => {
          if (row[idColumn] === id) Object.assign(row, changes);
        });
      });
    }

    const savedFormulas = await localforage.getItem('sheetFormulas');
    if (savedFormulas) {
      window.sheetFormulas = savedFormulas;
      updateFormulaColumns();
    }

    loadSheetData(defaultSheet);

    const sheetSelector = document.getElementById('sheetSelector');
    sheetSelector.innerHTML = '';
    sheetNames.forEach(sheetName => {
      const option = document.createElement('option');
      option.value = sheetName;
      option.textContent = sheetName;
      sheetSelector.appendChild(option);
    });
    sheetSelector.style.display = 'inline-block';
    sheetSelector.value = defaultSheet;
    sheetSelector.onchange = () => {
      loadSheetData(sheetSelector.value);
    };

    document.getElementById('loading').style.display = 'none';
    document.getElementById('residentTable').style.display = 'table';
  }
}

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

  document.getElementById('clearLocalStorageBtn').addEventListener('click', async () => {
  if (confirm("Are you sure you want to delete all saved data from this browser?")) {
    await localforage.removeItem('residentData');
    await localforage.removeItem('sheetDataMap');
    await localforage.removeItem('currentSheet');
    await localforage.removeItem('sheetFormulas');
    await localforage.removeItem('editedCells');
    await localforage.removeItem('conditionalFormatting');
    await localforage.removeItem('dropdownColumns');
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


