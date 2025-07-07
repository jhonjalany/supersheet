function goToPage(page) {
  if (isEditing) disableEditing();
  const totalPages = Math.ceil(filteredData.length / pageSize);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTable();
}
