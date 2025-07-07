function removeColumn(column) {
  if ([idColumn, fixedSecondColumn].includes(column)) return;
  const idx = visibleColumns.indexOf(column);
  if (idx > -1) {
    visibleColumns.splice(idx, 1);
    const fixedIndex = visibleColumns.indexOf(fixedSecondColumn);
    if (fixedIndex !== -1 && fixedIndex < visibleColumns.length - 1) {
      lastAddedColumnIndex = visibleColumns.length - 1;
    } else {
      lastAddedColumnIndex = fixedIndex;
    }
    initTable();
  }
}
