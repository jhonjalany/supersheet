


  function enableColumnReordering() {
  const table = document.getElementById('residentTable');
  const headers = table.querySelectorAll('thead th');
  let draggingIndex = -1;
  let dragTimer = null;

  headers.forEach((header, index) => {
    // Skip first (No.), second (ID), and last column (+)
    if (index === 0 || index === 1 || index === headers.length - 1) return;

    header.setAttribute('draggable', true);

    // DESKTOP DRAG EVENTS
    header.addEventListener('dragstart', e => {
      draggingIndex = header.cellIndex;
      header.classList.add('dragging');
      e.dataTransfer.setData('text/plain', header.cellIndex);
    });

    header.addEventListener('dragover', e => e.preventDefault());

    header.addEventListener('drop', e => {
      e.preventDefault();
      if (isEditing) disableEditing(true);
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
      const toIndex = header.cellIndex;

      if (fromIndex !== toIndex) moveColumn(fromIndex, toIndex);
      header.classList.remove('dragging');
      draggingIndex = -1;
    });

    header.addEventListener('dragend', () => {
      header.classList.remove('dragging');
    });

    // MOBILE TOUCH HANDLING
    header.addEventListener('touchstart', (e) => {
      if (isEditing || draggingIndex !== -1) return;

      const touch = e.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;
      const originalIndex = index;

      header.classList.add('dragging');
      document.querySelectorAll('thead th').forEach(th => th.classList.add('no-select'));

      const onTouchMove = (eMove) => {
        eMove.preventDefault();
        const moveTouch = eMove.touches[0];
        const deltaX = Math.abs(moveTouch.clientX - startX);
        const deltaY = Math.abs(moveTouch.clientY - startY);

        if (deltaX > 10 || deltaY > 10) {
          const target = document.elementFromPoint(moveTouch.clientX, moveTouch.clientY);
          const targetHeader = target?.closest('th');

          if (targetHeader && targetHeader !== header) {
            const toIndex = Array.from(targetHeader.parentNode.children).indexOf(targetHeader);

            // Skip reordering if target is first, second, or last column
            if ([0, 1, headers.length - 1].includes(toIndex)) return;

            if (toIndex !== draggingIndex) {
              moveColumn(originalIndex, toIndex);
            }
          }
        }
      };

      const onTouchEnd = () => {
        header.classList.remove('dragging');
        document.querySelectorAll('thead th').forEach(th => th.classList.remove('no-select'));
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        draggingIndex = -1;
      };

      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd, { once: true });
    });

    header.addEventListener('touchmove', () => {
      clearTimeout(dragTimer);
    });

    header.addEventListener('touchend', () => {
      clearTimeout(dragTimer);
    });
  });
}


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



