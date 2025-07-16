

function moveColumn(fromIndex, toIndex) {
  const rows = document.querySelectorAll('tr');
  rows.forEach(row => {
    const cells = Array.from(row.children);
    const movedCell = cells.splice(fromIndex, 1)[0];
    cells.splice(toIndex, 0, movedCell);
    row.innerHTML = '';
    cells.forEach(cell => row.appendChild(cell));
  });

  // Also move the summary row <td>
  const summaryRow = document.querySelector('#summaryRow');
  if (summaryRow) {
    const summaryCells = Array.from(summaryRow.children);
    const movedSummaryCell = summaryCells.splice(fromIndex, 1)[0];
    summaryCells.splice(toIndex, 0, movedSummaryCell);
    summaryRow.innerHTML = '';
    summaryCells.forEach(cell => summaryRow.appendChild(cell));
  }

  // Rebuild visibleColumns based on new header order
  const newHeaders = Array.from(document.querySelectorAll('thead th')).map(th => {
    const span = th.querySelector('span');
    return span ? span.textContent.trim() : '';
  }).filter(h => h); // remove empty strings

  visibleColumns.length = 0;
  visibleColumns.push(...newHeaders);
  lastAddedColumnIndex = visibleColumns.length - 1;

  if (isEditing) {
    disableEditing(true);
    document.getElementById('saveBtn').disabled = true;
    alert("Column reordered. Editing has been canceled.");
    document.getElementById('editBtn').classList.remove('hidden');
  }

  renderTable();
}


function isNumericColumn(header) {
  const lowerHeader = header.toLowerCase();
  const numericKeywords = ['age', 'zone', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'late'];
  const pattern = new RegExp(`\\b(${numericKeywords.join('|')})\\b`, 'i');
  return pattern.test(lowerHeader);
}


