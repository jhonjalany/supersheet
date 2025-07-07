function handleFileSelect(e) {
  const reader = new FileReader();
  const file = e.target.files[0];
  if (!file) return;

  document.getElementById('residentTable').style.display = 'none';
  document.getElementById('loading').style.display = 'block';

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    // Clear localStorage before saving new data
    localStorage.removeItem('residentData');
    localStorage.removeItem('sheetDataMap');
    localStorage.removeItem('currentSheet');

    // Store all sheets in memory
    sheetDataMap = {};
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { raw: false });
      sheetDataMap[sheetName] = json;
    });

    // Save new data to localStorage
    localStorage.setItem('sheetDataMap', JSON.stringify(sheetDataMap));

    // Load first sheet by default
    loadSheetData(workbook.SheetNames[0]);

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

    saveToLocalStorage();
    document.getElementById('loading').style.display = 'none';
    document.getElementById('residentTable').style.display = 'table';
  };
  reader.readAsArrayBuffer(file);
}
