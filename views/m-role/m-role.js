

function printSection() {
  window.print();
}

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

async function handleFileSelect(e) {
  const reader = new FileReader();
  const file = e.target.files[0];
  if (!file) return;

  document.getElementById('residentTable').style.display = 'none';
  document.getElementById('loading').style.display = 'block';

  reader.onload = async function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    // Clear localforage before saving new data
    await localforage.removeItem('residentData');
    await localforage.removeItem('sheetDataMap');
    await localforage.removeItem('currentSheet');
    await localforage.removeItem('sheetFormulas');
    await localforage.removeItem('editedCells');
    await localforage.removeItem('conditionalFormatting');
    await localforage.removeItem('dropdownColumns');

    // Store all sheets in memory
    sheetDataMap = {};
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { raw: false });
      sheetDataMap[sheetName] = json;
    });

    // Save new data to localforage
    await localforage.setItem('sheetDataMap', sheetDataMap);

    // Load first sheet by default
    const defaultSheet = workbook.SheetNames[0];
    loadSheetData(defaultSheet);

    // Populate sheet selector dropdown
    const sheetSelector = document.getElementById('sheetSelector');
    sheetSelector.innerHTML = '';
    workbook.SheetNames.forEach(sheetName => {
      const option = document.createElement('option');
      option.value = sheetName;
      option.textContent = sheetName;
      sheetSelector.appendChild(option);
    });
    sheetSelector.style.display = 'inline-block';

    // Handle sheet change
    sheetSelector.onchange = () => {
      loadSheetData(sheetSelector.value);
    };

    await saveToLocalStorage(); // Saves residentData, formulas, etc.

    document.getElementById('loading').style.display = 'none';
    document.getElementById('residentTable').style.display = 'table';
  };

  reader.readAsArrayBuffer(file);
}

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


