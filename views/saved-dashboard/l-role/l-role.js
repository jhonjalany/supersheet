


function loadSheetData(sheetName) {
  const sheetRows = sheetDataMap[sheetName] || [];
  residentData = ensureUniqueID(sheetRows.map((item, idx) => {
    const { Row_Number, row_number, ...rest } = item;
    rest.ID = rest.ID || `temp-${idx}`;
    return rest;
  }));
  
  const sampleRow = residentData[0];
  if (!sampleRow) return;

  const allKeys = Object.keys(sampleRow).filter(k => k !== 'Row Number');
  idColumn = allKeys.length > 0 ? allKeys[0] : 'ID';
  const otherKeys = allKeys.filter(k => k !== idColumn);

  visibleColumns.length = 0;
  visibleColumns.push('No.', idColumn);
  if (otherKeys.length > 0) {
    visibleColumns.push(otherKeys[0]);
    fixedSecondColumn = otherKeys[0];
  }

  optionalColumns.length = 0;
  optionalColumns.push(...otherKeys.filter(k => k !== fixedSecondColumn));
  filteredData = [...residentData];
  initTable(); // Re-initialize table
  document.getElementById('loading').style.display = 'none';
  document.getElementById('residentTable').style.display = 'table';
}


function saveToLocalStorage() {
  const currentSheet = document.getElementById('sheetSelector').value;
  localStorage.setItem('residentData', JSON.stringify(residentData));
  localStorage.setItem('sheetDataMap', JSON.stringify(sheetDataMap));
  localStorage.setItem('currentSheet', currentSheet);
  localStorage.setItem('sheetFormulas', JSON.stringify(window.sheetFormulas || {}));
  localStorage.setItem('editedCells', JSON.stringify(editedCells)); // Ensure edits are saved
  localStorage.setItem('conditionalFormatting', JSON.stringify(conditionalFormatting));
  localStorage.setItem('dropdownColumns', JSON.stringify(dropdownColumns));
}  

  function loadFromLocalStorage() {
  const residentDataStr = localStorage.getItem('residentData');
  const sheetDataMapStr = localStorage.getItem('sheetDataMap');
  const currentSheet = localStorage.getItem('currentSheet');
  const condFormatStr = localStorage.getItem('conditionalFormatting');
  const savedDropdowns = localStorage.getItem('dropdownColumns');
if (savedDropdowns) {
  Object.assign(dropdownColumns, JSON.parse(savedDropdowns));
}
if (condFormatStr) {
  conditionalFormatting = JSON.parse(condFormatStr);
}

  if (residentDataStr && sheetDataMapStr) {
    residentData = ensureUniqueID(JSON.parse(residentDataStr));
sheetDataMap = JSON.parse(sheetDataMapStr);
Object.keys(sheetDataMap).forEach(sheet => {
  sheetDataMap[sheet] = ensureUniqueID(sheetDataMap[sheet]);
});
filteredData = [...residentData];

    const sheetNames = Object.keys(sheetDataMap);
    let defaultSheet = currentSheet;

    if (!defaultSheet) {
      defaultSheet = sheetNames.length > 1 ? sheetNames[1] : sheetNames[0];
    }

    // Load editedCells
    const savedEdits = localStorage.getItem('editedCells');
    if (savedEdits) {
      editedCells = JSON.parse(savedEdits);
      // Apply manual edits before formulas
      Object.entries(editedCells).forEach(([id, changes]) => {
        residentData.forEach(row => {
          if (row[idColumn] === id) Object.assign(row, changes);
        });
        sheetDataMap[defaultSheet].forEach(row => {
          if (row[idColumn] === id) Object.assign(row, changes);
        });
        filteredData.forEach(row => {
          if (row[idColumn] === id) Object.assign(row, changes);
        });
      });
    }
    const savedFormulas = localStorage.getItem('sheetFormulas');
    if (savedFormulas) {
      window.sheetFormulas = JSON.parse(savedFormulas);
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

  const savedFormulas = localStorage.getItem('formulaColumns');
  if (savedFormulas) {
    formulaColumns = JSON.parse(savedFormulas);
    updateFormulaColumns();
  }
}



