function moveColumn(fromIndex, toIndex) {
  if (fromIndex === toIndex) return;

  const table = document.getElementById('residentTable');
  const rows = table.querySelectorAll('tr');

  // Move cells in each row
  rows.forEach(row => {
    const cells = Array.from(row.children);
    const [movedCell] = cells.splice(fromIndex, 1); // Remove from old index
    cells.splice(toIndex, 0, movedCell);             // Insert at new index

    // Rebuild row without using innerHTML for better performance
    const fragment = document.createDocumentFragment();
    cells.forEach(cell => fragment.appendChild(cell));
    row.appendChild(fragment); // This automatically clears the row and adds updated cells
  });

  // Update visibleColumns based on new header order
  const headers = table.querySelectorAll('thead th');
  const newHeaders = Array.from(headers).map(th => {
    const span = th.querySelector('span');
    return span ? span.textContent.trim() : '';
  }).filter(h => h);

  visibleColumns.length = 0;
  visibleColumns.push(...newHeaders);

  lastAddedColumnIndex = visibleColumns.length - 1;

  // Notify user and reset editing state
  if (isEditing) {
    disableEditing(true);
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.disabled = true;
    const editBtn = document.getElementById('editBtn');
    if (editBtn) editBtn.classList.remove('hidden');
    alert("Column reordered. Editing has been canceled.");
  }

  renderTable(); // Optional: re-render if needed
}