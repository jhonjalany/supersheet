



function evaluateFormula(formula, rowData) {
  try {
    let expr = formula.replace(/([a-zA-Z_][a-zA-Z0-9_]*)/g, match => {
      const val = rowData[match];
      return isNaN(val) ? `"${val}"` : parseFloat(val);
    });
    if (expr.startsWith('=')) expr = expr.substring(1);
    // Evaluate expression
    const result = Function('"use strict";return (' + expr + ')')();
    // Convert boolean results to strings
    if (typeof result === 'boolean') {
      return result ? "true" : "false";
    }
    return result;
  } catch (e) {
    return "Error";
  }
}

document.getElementById('addColumnForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const colName = document.getElementById('columnName').value.trim();
  const formula = document.getElementById('columnFormula').value.trim();
  const currentSheet = document.getElementById('sheetSelector').value;

  if (!colName) {
    alert("Please enter a column name.");
    return;
  }
  if (visibleColumns.includes(colName)) {
    alert("This column already exists!");
    return;
  }

  // Add column only to visible columns for current rendering
  visibleColumns.splice(visibleColumns.length - 1, 0, colName);
  optionalColumns.push(colName);

  // Store formula per sheet
  if (!window.sheetFormulas) window.sheetFormulas = {};
  window.sheetFormulas[currentSheet] = window.sheetFormulas[currentSheet] || {};
  window.sheetFormulas[currentSheet][colName] = formula;

  // Recalculate all rows only for current sheet
  updateFormulaColumns();

  initTable(); // Rebuild table UI
  saveToLocalStorage(); // Save updated state
  document.getElementById('addColumnModal').style.display = 'none';
  alert(`New column "${colName}" added to current sheet.`);
});

function updateFormulaColumns() {
  const currentSheet = document.getElementById('sheetSelector').value;
  if (!window.sheetFormulas || !window.sheetFormulas[currentSheet]) return;
  const formulas = window.sheetFormulas[currentSheet];
  Object.keys(formulas).forEach(colName => {
    const formula = formulas[colName];
    filteredData.forEach(row => {
      const id = row[idColumn];
      if (editedCells && editedCells[id] && editedCells[id][colName] !== undefined) {
        row[colName] = editedCells[id][colName];
      } else {
        try {
          row[colName] = evaluateFormula(formula, row);
        } catch (e) {
          row[colName] = 'Error';
        }
      }
    });
    residentData.forEach(row => {
      const id = row[idColumn];
      if (editedCells && editedCells[id] && editedCells[id][colName] !== undefined) {
        row[colName] = editedCells[id][colName];
      } else {
        try {
          row[colName] = evaluateFormula(formula, row);
        } catch (e) {
          row[colName] = 'Error';
        }
      }
    });
    if (sheetDataMap[currentSheet]) {
      sheetDataMap[currentSheet].forEach(row => {
        const id = row[idColumn];
        if (editedCells && editedCells[id] && editedCells[id][colName] !== undefined) {
          row[colName] = editedCells[id][colName];
        } else {
          try {
            row[colName] = evaluateFormula(formula, row);
          } catch (e) {
            row[colName] = 'Error';
          }
        }
      });
    }
  });
}


document.getElementById('cancelAddColBtn').addEventListener('click', () => {
  document.getElementById('addColumnModal').style.display = 'none';
});


