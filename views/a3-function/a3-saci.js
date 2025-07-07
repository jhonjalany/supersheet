function showAddColumnInput(cell) {
  cell.innerHTML = '';
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '8px';
  const select = document.createElement('select');
  const remaining = optionalColumns.filter(c => !visibleColumns.includes(c) && c !== idColumn && c !== fixedSecondColumn);
  remaining.forEach(col => {
    const option = document.createElement('option');
    option.value = col;
    option.textContent = col;
    select.appendChild(option);
  });
  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add';
  addBtn.className = 'add-col-btn';
  addBtn.onclick = () => {
    if (isEditing) disableEditing();
    const selectedCol = select.value;
    if (!visibleColumns.includes(selectedCol)) {
      const fixedIndex = visibleColumns.indexOf(fixedSecondColumn);
      const insertAfterIndex = lastAddedColumnIndex === 1 ? fixedIndex : lastAddedColumnIndex;
      visibleColumns.splice(insertAfterIndex + 1, 0, selectedCol);
      lastAddedColumnIndex = insertAfterIndex + 1;
      initTable();
    }
  };
  container.appendChild(select);
  container.appendChild(addBtn);
  cell.appendChild(container);
}

