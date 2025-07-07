 function loadFromLocalStorage() {
  const residentDataStr = localStorage.getItem('residentData');
  const sheetDataMapStr = localStorage.getItem('sheetDataMap');
  const currentSheet = localStorage.getItem('currentSheet');

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