


document.getElementById('addRowBtn').addEventListener('click', () => {
  openAddRowModal();
});

document.getElementById('exportPdfBtn').addEventListener('click', () => {
  document.getElementById('pdfOptionsModal').style.display = 'block';
});

document.getElementById('pdfStyleForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const fontSize = parseInt(document.getElementById('fontSize').value);
  const fontColor = document.getElementById('fontColor').value;
  const bgColor = document.getElementById('bgColor').value;
  const orientation = document.getElementById('orientation').value;

  const tableContainer = document.querySelector('.table-container');
  const originalStyles = {
    color: tableContainer.style.color,
    backgroundColor: tableContainer.style.backgroundColor,
    fontSize: tableContainer.style.fontSize,
  };

  // Apply custom styles temporarily
  tableContainer.style.color = fontColor;
  tableContainer.style.backgroundColor = bgColor;
  tableContainer.querySelectorAll('table, th, td').forEach(el => {
    el.style.fontSize = fontSize + 'px';
  });

  // Hide UI elements during export
  const actionButtons = document.querySelectorAll('.no-print');
  actionButtons.forEach(btn => btn.style.display = 'none');

  // Use html2canvas to capture styled table
  html2canvas(tableContainer).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });

    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save("ResidentData.pdf");

    // Restore original styles
    tableContainer.style.color = originalStyles.color;
    tableContainer.style.backgroundColor = originalStyles.backgroundColor;
    tableContainer.querySelectorAll('table, th, td').forEach(el => {
      el.style.fontSize = originalStyles.fontSize;
    });
    actionButtons.forEach(btn => btn.style.display = '');
    document.getElementById('pdfOptionsModal').style.display = 'none';
  });
});

// Close modal on cancel or click outside
document.getElementById('cancelPdfBtn')?.addEventListener('click', () => {
  document.getElementById('pdfOptionsModal').style.display = 'none';
});
document.querySelectorAll('#pdfOptionsModal .modal-close').forEach(el => {
  el.addEventListener('click', () => {
    document.getElementById('pdfOptionsModal').style.display = 'none';
  });
});

document.getElementById('addDropdownColumnBtn').addEventListener('click', () => {
  document.getElementById('dropdownOptionsContainer').innerHTML = `
    <div class="form-group">
      <label>Dropdown Option</label>
      <input type="text" class="dropdown-option-input" placeholder="Option 1" required />
    </div>
  `;
  document.getElementById('addDropdownColumnModal').style.display = 'block';
});

document.getElementById('addMoreOptionBtn').addEventListener('click', () => {
  const container = document.getElementById('dropdownOptionsContainer');
  const count = container.querySelectorAll('.form-group').length + 1;
  const group = document.createElement('div');
  group.className = 'form-group';
  group.innerHTML = `
    <label>Dropdown Option</label>
    <input type="text" class="dropdown-option-input" placeholder="Option ${count}" required />
  `;
  container.appendChild(group);
});


//----------------------------------------------advance search-----------------

function evaluateCondition(expr, row) {
  // Replace logical keywords with JS operators
  expr = expr.replace(/\bAND\b/g, '&&').replace(/\bOR\b/g, '||');

  const safeExpr = expr.replace(/([a-zA-Z_][a-zA-Z0-9_]*)/g, match => {
    const val = row[match];
    if (typeof val === 'string') {
      return `"${val}"`;
    }
    return isNaN(val) ? `"${val}"` : parseFloat(val);
  });

  try {
    return Function('"use strict";return (' + safeExpr + ')')();
  } catch (e) {
    throw new Error("Error evaluating condition: " + e.message);
  }
}







document.getElementById('advancedSearchBtn').addEventListener('click', function () {
  if (isEditing) disableEditing();
  const expr = document.getElementById('advancedFilterInput').value.trim();
  if (!expr) {
    alert("Please enter a valid condition.");
    return;
  }
  try {
    // Apply filter
    filteredData = residentData.filter(row => evaluateCondition(expr, row));
    currentPage = 1;
    renderTable();
  } catch (e) {
    alert("Invalid expression: " + e.message);
  }
});

document.getElementById('resetAdvancedFilterBtn').addEventListener('click', function () {
  document.getElementById('advancedFilterInput').value = '';
  filteredData = [...residentData];
  currentPage = 1;
  sortColumn = null;
  sortDirection = 'asc';
  renderTable();
});





