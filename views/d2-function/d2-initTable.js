function initTable() {
  const headerRow = document.getElementById('headerRow');
  const filterRow = document.getElementById('filterRow');
  headerRow.innerHTML = '';
  filterRow.innerHTML = '';

  visibleColumns.forEach((col, index) => {
    const th = createHeaderCell(col);
    headerRow.appendChild(th);
    const ft = createFilterCell(col);
    filterRow.appendChild(ft);
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

  document.getElementById('editBtn').onclick = () => {
    document.getElementById('editBtn').classList.add('hidden');
    enableEditing();
  };
  document.getElementById('saveBtn').onclick = saveEditedData;

  document.querySelector('#residentTable tbody').addEventListener('click', function (e) {
    const clickedRow = e.target.closest('tr');
    if (!clickedRow) return;
    document.querySelectorAll('#residentTable tbody tr').forEach(row => row.classList.remove('row-selected'));
    clickedRow.classList.add('row-selected');
  });

  renderTable();
}
