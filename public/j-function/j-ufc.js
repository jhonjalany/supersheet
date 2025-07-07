function updateFormulaColumns() {
  const currentSheet = document.getElementById('sheetSelector').value;
  if (!window.sheetFormulas || !window.sheetFormulas[currentSheet]) return;

  const formulas = window.sheetFormulas[currentSheet];

  Object.keys(formulas).forEach(colName => {
    const formula = formulas[colName];
    filteredData.forEach(row => {
      const id = row[idColumn];
      if (editedCells && editedCells[id] && editedCells[id][colName] !== undefined) {
        row[colName] = editedCells[id][colName];
      } else {
        try {
          row[colName] = evaluateFormula(formula, row);
        } catch (e) {
          row[colName] = 'Error';
        }
      }
    });
    residentData.forEach(row => {
      const id = row[idColumn];
      if (editedCells && editedCells[id] && editedCells[id][colName] !== undefined) {
        row[colName] = editedCells[id][colName];
      } else {
        try {
          row[colName] = evaluateFormula(formula, row);
        } catch (e) {
          row[colName] = 'Error';
        }
      }
    });
    if (sheetDataMap[currentSheet]) {
      sheetDataMap[currentSheet].forEach(row => {
        const id = row[idColumn];
        if (editedCells && editedCells[id] && editedCells[id][colName] !== undefined) {
          row[colName] = editedCells[id][colName];
        } else {
          try {
            row[colName] = evaluateFormula(formula, row);
          } catch (e) {
            row[colName] = 'Error';
          }
        }
      });
    }
  });
}