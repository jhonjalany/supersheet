function loadSheetData(sheetName) {
  residentData = ensureUniqueID(sheetDataMap[sheetName].map((item, idx) => {
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