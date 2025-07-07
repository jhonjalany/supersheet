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