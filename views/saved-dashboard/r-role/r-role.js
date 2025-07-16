

document.getElementById('generateChartBtn').addEventListener('click', () => {
  const xCol = document.getElementById('xAxisSelect').value;
  const yCol = document.getElementById('yAxisSelect').value;
  const chartType = document.getElementById('chartTypeSelect').value;

  if (!xCol || !yCol) {
    alert("Please select both X and Y axes.");
    return;
  }

  let labels = [];
  let data = [];

  if (chartType === 'pie' || chartType === 'doughnut') {
    // Use actual numeric values from yCol grouped by xCol
    filteredData.forEach(row => {
      const label = row[xCol];
      const value = parseFloat(row[yCol]);
      if (!isNaN(value)) {
        labels.push(label);
        data.push(value);
      }
    });

    if (data.length === 0) {
      alert("No valid numeric data found for the selected Y-axis column.");
      return;
    }
  } else {
    // Line/Bar/etc.
    filteredData.forEach(row => {
      labels.push(row[xCol]);
      data.push(parseFloat(row[yCol]));
    });
  }

  const ctx = document.getElementById('residentChart').getContext('2d');
  if (residentChart) {
    residentChart.destroy();
  }

  const savedSize = loadChartSize();
  const resizer = document.getElementById('resizer');
  resizer.style.width = typeof savedSize.width === 'number' ? `${savedSize.width}px` : savedSize.width;
  resizer.style.height = `${savedSize.height}px`;

  residentChart = new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: [{
        label: `${yCol}`,
        data: data,
        backgroundColor: getRandomColors(data.length),
        borderColor: getRandomColors(data.length, true),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `${chartType.toUpperCase()} Chart: ${xCol} vs ${yCol}`
        },
        legend: { display: !(chartType === 'pie' || chartType === 'doughnut') },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              let value = context.parsed || 0;
              return `${label}: ${value}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          display: chartType !== 'pie' && chartType !== 'doughnut'
        }
      }
    }
  });

  document.getElementById('chartContainer').style.display = 'block';

  // Save size on resize
  document.getElementById('resizer').addEventListener('scroll', saveChartSize);
});

let resizeTimeout;

document.getElementById('resizer').addEventListener('scroll', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (residentChart) {
      residentChart.resize();
    }
  }, 200);
});


