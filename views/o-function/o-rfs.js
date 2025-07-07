function renderFormulaSamples() {
  const formula = document.getElementById('columnFormula').value.trim();
  const ul = document.getElementById('sampleOutput');
  ul.innerHTML = '';
  if (!formula) return;

  const sampleRows = filteredData.slice(0, 10);
  sampleRows.forEach((row, index) => {
    try {
      const result = evaluateFormula(formula, row);
      ul.innerHTML += `<li><strong>Row ${index + 1}:</strong> ${result}</li>`;
    } catch (e) {
      ul.innerHTML += `<li><strong>Row ${index + 1}:</strong> Invalid formula</li>`;
    }
  });
}
document.getElementById('columnFormula').addEventListener('input', renderFormulaSamples);