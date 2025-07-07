function moveColumn(fromIndex, toIndex) {
  const rows = document.querySelectorAll('tr');
  rows.forEach(row => {
    const cells = Array.from(row.children);
    const movedCell = cells.splice(fromIndex, 1)[0];
    cells.splice(toIndex, 0, movedCell);
    row.innerHTML = '';
    cells.forEach(cell => row.appendChild(cell));
  });

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
