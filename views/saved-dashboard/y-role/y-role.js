

document.getElementById('conditionalFormatForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const currentSheet = document.getElementById('sheetSelector').value;
  const column = document.getElementById('cfColumn').value;
  const condition = document.getElementById('cfCondition').value;
  const value = document.getElementById('cfValue').value.trim();
  const color = document.getElementById('cfColor').value;

  if (!column || !condition) return;

  if (!conditionalFormatting[currentSheet]) {
    conditionalFormatting[currentSheet] = [];
  }

  conditionalFormatting[currentSheet].push({
    column,
    condition,
    value,
    color
  });

  saveToLocalStorage();
  renderTable(); // Re-render with new formatting
  alert("Conditional rule saved.");
  document.getElementById('conditionalFormatModal').style.display = 'none';
});


// Extracts referenced column names from a formula string
function getReferencedColumns(formula) {
  const matches = formula.match(/([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
  return [...new Set(matches)];
}


let residentChart = null;

function getRandomColors(count, isBorder = false) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * 200) + 50;
    const g = Math.floor(Math.random() * 200) + 50;
    const b = Math.floor(Math.random() * 200) + 50;
    colors.push(`rgba(${r}, ${g}, ${b}, ${isBorder ? 1 : 0.6})`);
  }
  return colors;
}

function updateChartOptions() {
  const xAxisSelect = document.getElementById('xAxisSelect');
  const yAxisSelect = document.getElementById('yAxisSelect');
  xAxisSelect.innerHTML = '';
  yAxisSelect.innerHTML = '';

  visibleColumns.slice(1).forEach(col => {
    const optionX = document.createElement('option');
    optionX.value = col;
    optionX.textContent = col;
    xAxisSelect.appendChild(optionX);

    const optionY = document.createElement('option');
    optionY.value = col;
    optionY.textContent = col;
    yAxisSelect.appendChild(optionY);
  });
}


