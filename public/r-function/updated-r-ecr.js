function enableColumnReordering() {
  const table = document.getElementById('residentTable');
  const headers = Array.from(table.querySelectorAll('thead th'));
  let draggingIndex = -1;

  // Utility: Get current header index in real-time
  function getHeaderIndex(header) {
    return Array.from(header.parentNode.children).indexOf(header);
  }

  headers.forEach((header, originalIndex) => {
    // Skip first (No.), second (ID), and last column (+)
    if (originalIndex === 0 || originalIndex === 1 || originalIndex === headers.length - 1) return;

    header.setAttribute('draggable', true);

    // DESKTOP DRAG EVENTS
    header.addEventListener('dragstart', e => {
      draggingIndex = getHeaderIndex(header);
      header.classList.add('dragging');
      e.dataTransfer.setData('text/plain', draggingIndex);
    });

    header.addEventListener('dragover', e => e.preventDefault());

    header.addEventListener('drop', e => {
      e.preventDefault();
      if (isEditing) disableEditing(true);
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
      const toIndex = getHeaderIndex(header);

      if (fromIndex !== toIndex && ![0, 1, headers.length - 1].includes(toIndex)) {
        moveColumn(fromIndex, toIndex);
      }
      header.classList.remove('dragging');
      draggingIndex = -1;
    });

    header.addEventListener('dragend', () => {
      header.classList.remove('dragging');
      draggingIndex = -1;
    });

    // MOBILE TOUCH HANDLING
    header.addEventListener('touchstart', (e) => {
      if (isEditing || draggingIndex !== -1) return;

      const touch = e.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;
      const initialIndex = getHeaderIndex(header);

      // Prevent accidental selection
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
            const toIndex = getHeaderIndex(targetHeader);

            // Skip if target is fixed (first, second, last)
            if ([0, 1, headers.length - 1].includes(toIndex)) return;

            // Move only if indices differ
            if (toIndex !== draggingIndex) {
              moveColumn(initialIndex, toIndex);
              draggingIndex = toIndex; // Update dragging index for future moves
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

    header.addEventListener('touchmove', (e) => {
      // Prevent scrolling while dragging
      e.preventDefault();
    });
  });
}