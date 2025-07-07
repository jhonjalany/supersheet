function openAddColumnModal() {
  const currentSheet = document.getElementById('sheetSelector').value;
  const sampleRow = sheetDataMap[currentSheet][0] || {};
  const colNames = Object.keys(sampleRow).filter(k => k !== 'Row Number');

  // Populate column names into help text
  const formulaInput = document.getElementById('columnFormula');
  formulaInput.placeholder = `e.g. ${colNames[0]} + ${colNames[1]}`;
  document.querySelector('#addColumnForm small').textContent =
    'Available columns: ' + colNames.join(', ');

  document.getElementById('columnName').value = '';
  document.getElementById('columnFormula').value = '';
  document.getElementById('sampleOutput').innerHTML = '';

  document.getElementById('addColumnModal').style.display = 'block';

  renderFormulaSamples(); // Initial empty samples
}