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
      if (editableSpan) {
        newValue = editableSpan.innerText.trim();
      } else if (dateInput) {
        newValue = dateInput.value;
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

  updatedRows.forEach(rowUpdate => {
    const id = rowUpdate[idColumn];
    const filteredIndex = filteredData.findIndex(r => r[idColumn] === id);
    const residentIndex = residentData.findIndex(r => r[idColumn] === id);
    const sheetIndex = sheetDataMap[currentSheet].findIndex(r => r[idColumn] === id);

    // Save manual edit in `editedCells`
    Object.entries(rowUpdate).forEach(([col, val]) => {
      if (!editedCells[id]) editedCells[id] = {};
      editedCells[id][col] = val;
    });

    if (filteredIndex !== -1) {
      Object.assign(filteredData[filteredIndex], rowUpdate);
    }
    if (residentIndex !== -1) {
      Object.assign(residentData[residentIndex], rowUpdate);
    }
    if (sheetIndex !== -1) {
      Object.assign(sheetDataMap[currentSheet][sheetIndex], rowUpdate);
    }
  });

  document.querySelectorAll('.edited-cell').forEach(cell => {
    cell.classList.remove('edited-cell');
  });

  saveToLocalStorage();
  alert('All changes saved locally.');
  disableEditing();
}