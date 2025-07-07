function disableEditing(resetOnly = false) {
  const rows = document.querySelectorAll('#residentTable tbody tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    cells.forEach((cell, index) => {
      if (index === 0 || index === 1) return;
      const editableSpan = cell.querySelector('.editable-number');
      if (editableSpan) {
        const value = editableSpan.innerText;
        cell.innerHTML = value;
      } else {
        cell.contentEditable = 'false';
      }
    });
  });
  if (!resetOnly) {
    document.getElementById('saveBtn').disabled = true;
    isEditing = false;
    document.getElementById('editBtn').classList.remove('hidden');
  }
}