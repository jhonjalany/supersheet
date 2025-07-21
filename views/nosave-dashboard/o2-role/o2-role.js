

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




function isDateColumn(header) {
  const lowerHeader = header.toLowerCase();
  const dateKeywords = ['date', 'dob', 'birthday', 'birthdate', 'anniversary'];
  const pattern = new RegExp(`\\b(${dateKeywords.join('|')})\\b`, 'i');
  return pattern.test(lowerHeader);
}

function isTimeColumn(header) {
  const lowerHeader = header.toLowerCase();
  const timeKeywords = ['time', 'start time', 'end time', 'login', 'logout', 'duration'];
  const pattern = new RegExp(`\\b(${timeKeywords.join('|')})\\b`, 'i');
  return pattern.test(lowerHeader);
}

function isDropdownColumn(header) {
  const currentSheet = document.getElementById('sheetSelector').value;
  const sheetRows = sheetDataMap[currentSheet] || [];

  // Define keywords to exempt from dropdown
  const dateKeywords = ['date', 'dob', 'birthday', 'birthdate', 'anniversary'];
  const timeKeywords = ['time', 'start time', 'end time', 'login', 'logout', 'duration'];
  const numericKeywords = [
    'age', 'absent',
    'quantity', 'price', 'total', 'cost', 'sold', 'amount',
    'profit', 'score', 'rank', 'point', 'points', 'fee',
    'late', 'count', 'level'
  ];

  const exemptKeywords = [...dateKeywords, ...timeKeywords, ...numericKeywords];
  const lowerHeader = header.toLowerCase();

  // Skip if column name matches any exempt keyword
  if (exemptKeywords.some(keyword => lowerHeader.includes(keyword))) {
    return false;
  }

  // Get all unique values in this column
  const uniqueValues = [...new Set(sheetRows.map(row => row[header]).filter(v => v !== undefined && v !== ''))];

  // Only create dropdown if 5 or fewer unique values
  return uniqueValues.length <= 10;
}

function isNumericColumn(header) {
  const lowerHeader = header.toLowerCase();
  const numericKeywords = [
    'age', 'absent',
    'quantity', 'price', 'total', 'cost', 'sold', 'amount',
    'profit', 'score', 'rank', 'point', 'points', 'fee',
    'late', 'count', 'level'
  ];
  const pattern = new RegExp(`\\b(${numericKeywords.join('|')})\\b`, 'i');
  return pattern.test(lowerHeader);
}



