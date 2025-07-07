function enableEditing() {
  isEditing = true;
  const numericColumns = ['Age','Zone Number','January', 'JANUARY', 'February', 'FEBRUARY', 'March', 'MARCH', 'April', 'APRIL', 'May', 'MAY', 'June', 'JUNE', 'July', 'JULY', 'August', 'AUGUST', 'September', 'SEPTEMBER', 'October', 'OCTOBER', 'November', 'NOVEMBER', 'December', 'DECEMBER'];
  const rows = document.querySelectorAll('#residentTable tbody tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    cells.forEach((cell, index) => {
      if (index === 0 || index === 1) return;
      const colName = visibleColumns.slice(1)[index - 1];
      const isDateColumn = /date/i.test(colName); // Check if column name contains "date"
      cell.contentEditable = 'false'; // Reset
      if (isDateColumn) {
        // Create date input
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.className = 'date-input';
        dateInput.value = cell.innerText.trim();
        // Clear cell and append date input
        cell.innerHTML = '';
        cell.appendChild(dateInput);
        // Add change listener
        dateInput.addEventListener('change', () => {
          if (!cell.classList.contains('edited-cell')) {
            cell.classList.add('edited-cell');
          }
          document.getElementById('saveBtn').disabled = false;
        });
      } else if (numericColumns.includes(colName)) {
        // Handle numeric columns as before
        cell.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <button class="minus-btn">-</button>
            <span contenteditable="true" class="editable-number">${cell.innerText}</span>
            <button class="plus-btn">+</button>
          </div>
        `;
        cell.querySelector('.minus-btn').addEventListener('click', () => {
          let val = parseInt(cell.querySelector('.editable-number').innerText);
          if (!isNaN(val)) val--;
          cell.querySelector('.editable-number').innerText = val;
          if (!cell.classList.contains('edited-cell')) {
            cell.classList.add('edited-cell');
          }
          document.getElementById('saveBtn').disabled = false;
        });
        cell.querySelector('.plus-btn').addEventListener('click', () => {
          let val = parseInt(cell.querySelector('.editable-number').innerText);
          if (!isNaN(val)) val++;
          cell.querySelector('.editable-number').innerText = val;
          if (!cell.classList.contains('edited-cell')) {
            cell.classList.add('edited-cell');
          }
          document.getElementById('saveBtn').disabled = false;
        });
        cell.querySelector('.editable-number').addEventListener('input', () => {
          if (!cell.classList.contains('edited-cell')) {
            cell.classList.add('edited-cell');
          }
          document.getElementById('saveBtn').disabled = false;
        });
      } else {
        // Regular text editing
        cell.contentEditable = 'true';
        cell.onbeforeinput = (e) => {
          if (numericColumns.includes(colName)) {
            const allowedInput = /^[\d\b]+$/.test(e.data || '');
            if (!allowedInput && e.data !== null) {
              e.preventDefault();
            }
          }
        };
        cell.addEventListener('input', () => {
          if (!cell.classList.contains('edited-cell')) {
            cell.classList.add('edited-cell');
          }
          document.getElementById('saveBtn').disabled = false;
        });
      }
    });
  });
  // Add styles dynamically for buttons
  const style = document.createElement('style');
  style.textContent = `
    .minus-btn {
      background-color: red;
      color: white;
      border: none;
      padding: 4px 8px;
      margin-right: 4px;
      cursor: pointer;
      border-radius: 4px;
    }
    .plus-btn {
      background-color: blue;
      color: white;
      border: none;
      padding: 4px 8px;
      margin-left: 4px;
      cursor: pointer;
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);
}