


function saveEditedData() {
  const updatedRows = [];
  const rows = document.querySelectorAll('#residentTable tbody tr');
  rows.forEach((row, i) => {
    const dataIndex = (currentPage - 1) * pageSize + i;
    const originalRow = { ...filteredData[dataIndex] };
    const updatedRow = {};
    visibleColumns.slice(1).forEach((col, j) => {
      let newValue = '';
const editableSpan = row.querySelector(`td:nth-child(${j + 2}) .editable-number`);
const dateInput = row.querySelector(`td:nth-child(${j + 2}) input[type="date"]`);
const select = row.querySelector(`td:nth-child(${j + 2}) select`);

if (editableSpan) {
  newValue = editableSpan.innerText.trim();
} else if (dateInput) {
  newValue = dateInput.value;
} else if (select) {
  newValue = select.value;
} else {
  newValue = row.querySelector(`td:nth-child(${j + 2})`).innerText.trim();
}
      const originalValue = (originalRow[col] || '').toString().trim();
      if (newValue !== originalValue) {
        updatedRow[col] = newValue;
      }
    });
    if (Object.keys(updatedRow).length > 0) {
      const id = originalRow[idColumn];
      updatedRow[idColumn] = id;
      updatedRows.push(updatedRow);
    }
  });

  if (updatedRows.length === 0) {
    alert("No changes to save.");
    return;
  }

  const currentSheet = document.getElementById('sheetSelector').value;

  // Recalculate only relevant formula columns per row
  const sheetFormulas = window.sheetFormulas?.[currentSheet] || {};

  updatedRows.forEach(rowUpdate => {
    const id = rowUpdate[idColumn];

    // Save manual edit into `editedCells`
    Object.entries(rowUpdate).forEach(([col, val]) => {
      if (!editedCells[id]) editedCells[id] = {};
      editedCells[id][col] = val;
    });

    const filteredIndex = filteredData.findIndex(r => r[idColumn] === id);
    const residentIndex = residentData.findIndex(r => r[idColumn] === id);
    const sheetIndex = sheetDataMap[currentSheet].findIndex(r => r[idColumn] === id);

    // Apply manual updates
    if (filteredIndex !== -1) {
      Object.assign(filteredData[filteredIndex], rowUpdate);
    }
    if (residentIndex !== -1) {
      Object.assign(residentData[residentIndex], rowUpdate);
    }
    if (sheetIndex !== -1) {
      Object.assign(sheetDataMap[currentSheet][sheetIndex], rowUpdate);
    }

    // Recalculate formula columns only if referenced columns have been edited
    const editedCols = Object.keys(rowUpdate);
    Object.keys(sheetFormulas).forEach(formulaCol => {
      const formula = sheetFormulas[formulaCol];
      const dependsOn = getReferencedColumns(formula); // Helper to extract column names from formula
      if (dependsOn.some(col => editedCols.includes(col))) {
        try {
          const updatedValue = evaluateFormula(formula, filteredData[filteredIndex]);
          filteredData[filteredIndex][formulaCol] = updatedValue;
          residentData[residentIndex][formulaCol] = updatedValue;
          sheetDataMap[currentSheet][sheetIndex][formulaCol] = updatedValue;
        } catch (e) {
          console.error(`Error recalculating ${formulaCol} for ID: ${id}`, e);
        }
      }
    });
  });

  document.querySelectorAll('.edited-cell').forEach(cell => {
    cell.classList.remove('edited-cell');
  });

  saveToLocalStorage();
  renderTable(); // Re-render to show updated values
  disableEditing();
}
