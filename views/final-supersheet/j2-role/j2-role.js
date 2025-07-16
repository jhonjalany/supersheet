

function initTable() {
  const headerRow = document.getElementById('headerRow');
  const filterRow = document.getElementById('filterRow');
  const summaryRow = document.getElementById('summaryRow');

  headerRow.innerHTML = '';
  filterRow.innerHTML = '';
  summaryRow.innerHTML = '';

  visibleColumns.forEach((col, index) => {
    const th = createHeaderCell(col);
    headerRow.appendChild(th);

    const ft = createFilterCell(col);
    filterRow.appendChild(ft);

    // Summary cell
    const sf = document.createElement('td');
    if (index === 0) {
      sf.textContent = 'Totals:';
      sf.style.fontWeight = 'bold';
    } else {
      sf.innerHTML = `
        <td>
  <div style="display:flex; flex-direction:column; gap:4px; font-size:12px;" class="no-print" >
    <div style="display:flex; align-items:center; gap:6px;">
      <strong>Sum:</strong>
      <button onclick='calculateColumnSummary("${col}", "sum")' class="action-btn no-print" style="font-size:20px; padding:2px 6px; background-color: #3498db;">Calculate</button>
    </div>
    <div style="display:flex; align-items:center; gap:6px;">
      <strong>Avg:</strong>
      <button onclick='calculateColumnSummary("${col}", "avg")' class="action-btn no-print" style="font-size:20px; padding:2px 6px; background-color: #9b59b6;">Calculate</button>
    </div>
    <div id="result-${col}" style="margin-top:4px; font-weight:bold; color:#2c3e50; font-size:20px;"></div>
  </div>
</td>`;
    }
    summaryRow.appendChild(sf);
  });

  const addTh = document.createElement('th');
  const addButton = document.createElement('button');
  addButton.textContent = '+';
  addButton.className = 'add-col-btn no-print';
  addButton.onclick = () => showAddColumnInput(addTh);
  addTh.appendChild(addButton);
  headerRow.appendChild(addTh);
  const ft = document.createElement('th');
  filterRow.appendChild(ft);

  enableColumnReordering();
  renderTable(); // Re-render after updating layout
  updateChartOptions(); // Call this after updating headers/columns
}

function calculateColumnSummary(columnName, type = 'sum') {
  const values = filteredData
    .map(row => parseFloat(row[columnName]))
    .filter(val => !isNaN(val));

  const total = values.reduce((acc, val) => acc + val, 0);
  const count = values.length;
  const resultSpan = document.getElementById(`result-${columnName}`);
  let output = '';

  if (type === 'sum') {
    output = `Total: ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (type === 'avg' && count > 0) {
    const avg = total / count;
    output = `Average: ${avg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    output = `N/A`;
  }

  resultSpan.textContent = output;
}

function createHeaderCell(col) {
  const th = document.createElement('th');
  if (col === 'No.') {
    th.innerHTML = `<div class="th-content"><span>No.</span></div>`;
    return th;
  }
  const div = document.createElement('div');
  div.className = 'th-content';
  if (!['No.', idColumn, fixedSecondColumn].includes(col)) {
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.className = 'remove-col-btn no-print';
    removeBtn.title = 'Remove Column';
    removeBtn.onclick = () => removeColumn(col);
    div.appendChild(removeBtn);
  }
  const span = document.createElement('span');
  span.textContent = col;
  const indicator = document.createElement('span');
  indicator.className = 'sort-indicator';
  indicator.id = `indicator-${col}`;
  div.appendChild(span);
  div.appendChild(indicator);
  th.appendChild(div);
  th.onclick = () => sortTable(col);
  return th;
}

