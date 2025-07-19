
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('fileInput').addEventListener('change', handleFileSelect);
  document.getElementById('pageSize').addEventListener('change', e => {
    if (isEditing) disableEditing();
    pageSize = parseInt(e.target.value);
    currentPage = 1;
    renderTable();
  });

  // File Input
  if (localStorage.getItem('residentData')) {
    loadFromLocalStorage();
  } else {
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
  }

  document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-close')) {
    const modal = e.target.closest('.modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
});

  // Download Button
  document.getElementById('downloadBtn').addEventListener('click', () => {
  const wb = XLSX.utils.book_new();

  for (const sheetName in sheetDataMap) {
    const ws = XLSX.utils.json_to_sheet(sheetDataMap[sheetName]);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  XLSX.writeFile(wb, "ResidentData_Modified.xlsx");
});

  // Modal close handlers
  document.querySelector('.modal-close')?.addEventListener('click', () => {
    document.getElementById('addRowModal').style.display = 'none';
  });
  document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => {
    document.getElementById('deleteModal').style.display = 'none';
  });
  document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
  const currentSheet = document.getElementById('sheetSelector').value;

  const idToDelete = selectedRowForDelete?.[idColumn];

if (idToDelete) {
  // Remove from residentData
  residentData = residentData.filter(row => row[idColumn] !== idToDelete);

  // Remove from filteredData
  filteredData = filteredData.filter(row => row[idColumn] !== idToDelete);

  // Remove from current sheet's data
  sheetDataMap[currentSheet] = sheetDataMap[currentSheet].filter(row => row[idColumn] !== idToDelete);

  // Re-render the table
  renderTable();

  alert("Row deleted locally.");
}
  saveToLocalStorage();
  
  document.getElementById('deleteModal').style.display = 'none';
  selectedRowForDelete = null;
  selectedRowIndex = -1;
  
});
document.getElementById('conditionalFormatBtn')?.addEventListener('click', openConditionalFormatModal);
document.getElementById('cancelCFBtn')?.addEventListener('click', () => {
  document.getElementById('conditionalFormatModal').style.display = 'none';
});
document.querySelectorAll('#conditionalFormatModal .modal-close').forEach(el => {
  el.addEventListener('click', () => {
    document.getElementById('conditionalFormatModal').style.display = 'none';
  });
});
document.getElementById('editBtn').addEventListener('click', () => {
  if (!isEditing) {
    enableEditing();
    document.getElementById('saveBtn').disabled = false;
    document.getElementById('editBtn').classList.add('hidden'); // Optional: hide Edit button while editing
  }
});
document.getElementById('saveBtn').addEventListener('click', saveEditedData);
});


