function saveToLocalStorage() {
  const currentSheet = document.getElementById('sheetSelector').value;
  localStorage.setItem('residentData', JSON.stringify(residentData));
  localStorage.setItem('sheetDataMap', JSON.stringify(sheetDataMap));
  localStorage.setItem('currentSheet', currentSheet);
  localStorage.setItem('sheetFormulas', JSON.stringify(window.sheetFormulas || {}));
  localStorage.setItem('editedCells', JSON.stringify(editedCells)); // Ensure edits are saved
}  