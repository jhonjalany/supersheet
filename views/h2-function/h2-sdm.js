function showDeleteMenu(event, id, index) {
  event.preventDefault();
  const currentSheet = document.getElementById('sheetSelector').value;
  const originalSheetData = sheetDataMap[currentSheet];
  const pageIndex = (currentPage - 1) * pageSize + index;
  const idInOriginal = filteredData[pageIndex]?.[idColumn];

  selectedRowForDelete = { [idColumn]: idInOriginal };
  selectedRowIndex = originalSheetData.findIndex(r => r[idColumn] === idInOriginal);

  const modal = document.getElementById('deleteModal');
  modal.style.display = 'block';
}