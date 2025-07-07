function updateSortIndicators() {
  document.querySelectorAll('.sort-indicator').forEach(el => el.textContent = '');
  const indicator = document.getElementById(`indicator-${sortColumn}`);
  if (indicator) {
    indicator.textContent = sortDirection === 'asc' ? ' ↑' : ' ↓';
  }
}
