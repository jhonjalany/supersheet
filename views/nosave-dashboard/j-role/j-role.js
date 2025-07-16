// Optional: Save chart size to localStorage
function saveChartSize() {
  const resizer = document.getElementById('resizer');
  const size = {
    width: resizer.clientWidth,
    height: resizer.clientHeight
  };
  localStorage.setItem('chartSize', JSON.stringify(size));
}

window.addEventListener('resize', () => {
  if (residentChart) {
    residentChart.resize();
  }
});

function loadChartSize() {
  const saved = localStorage.getItem('chartSize');
  if (saved) {
    return JSON.parse(saved);
  }
  return { width: '100%', height: 400 };
}

// Update chart size on reset
document.getElementById('resetChartSizeBtn').addEventListener('click', () => {
  const resizer = document.getElementById('resizer');
  resizer.style.width = '100%';
  resizer.style.height = '400px';
  localStorage.removeItem('chartSize');
  if (residentChart) {
    residentChart.resize();
  }
});

// Close delete modal on cancel or outside click
document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => {
  document.getElementById('deleteModal').style.display = 'none';
});

document.querySelectorAll('#deleteModal .modal-close').forEach(el => {
  el.addEventListener('click', () => {
    document.getElementById('deleteModal').style.display = 'none';
  });
});

window.addEventListener('click', (event) => {
  const modal = document.getElementById('deleteModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});