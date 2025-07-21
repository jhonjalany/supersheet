
function enableEditing() {
  isEditing = true;
  const rows = document.querySelectorAll('#residentTable tbody tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    cells.forEach((cell, index) => {
      if (index === 0 || index === 1) return; // Skip "No." and ID columns

      const colName = visibleColumns.slice(1)[index - 1];
      cell.contentEditable = 'false'; // Reset

      // Dropdown Column Handling (≤ 5 unique values)
      if (isDropdownColumn(colName)) {
        const select = document.createElement('select');
        const currentSheet = document.getElementById('sheetSelector').value;
        const sheetRows = sheetDataMap[currentSheet] || [];

        // Get unique values for this column
        const uniqueValues = [...new Set(sheetRows.map(row => row[colName]).filter(v => v !== undefined && v !== ''))];

        // Create a container div to hold the dropdown and buttons
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '8px';
        wrapper.style.flexWrap = 'wrap';

        // Populate dropdown
        uniqueValues.forEach(value => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        });
        select.value = cell.innerText.trim();

        // + Button to add new option
        const addOptionBtn = document.createElement('button');
        addOptionBtn.textContent = '+';
        addOptionBtn.className = 'dropdown-add-btn';
        addOptionBtn.title = 'Add new option';
        addOptionBtn.style.background = '#2ecc71';
        addOptionBtn.style.color = 'white';
        addOptionBtn.style.border = 'none';
        addOptionBtn.style.borderRadius = '4px';
        addOptionBtn.style.cursor = 'pointer';
        addOptionBtn.style.padding = '4px 8px';

        // Edit Button
        const editOptionBtn = document.createElement('button');
        editOptionBtn.textContent = '✎';
        editOptionBtn.className = 'dropdown-edit-btn';
        editOptionBtn.title = 'Edit selected option';
        editOptionBtn.style.background = '#f39c12';
        editOptionBtn.style.color = 'white';
        editOptionBtn.style.border = 'none';
        editOptionBtn.style.borderRadius = '4px';
        editOptionBtn.style.cursor = 'pointer';
        editOptionBtn.style.padding = '4px 8px';

        // Append dropdown and buttons
        wrapper.appendChild(select);
        wrapper.appendChild(addOptionBtn);
        wrapper.appendChild(editOptionBtn);

        // Event: Add new option
        addOptionBtn.addEventListener('click', () => {
          const newOption = prompt("Enter new option for column '" + colName + "':");
          if (newOption && !uniqueValues.includes(newOption)) {
            const option = document.createElement('option');
            option.value = newOption;
            option.textContent = newOption;
            select.appendChild(option);
            select.value = newOption;

            // Update dropdownColumns
            if (!dropdownColumns[currentSheet]) dropdownColumns[currentSheet] = {};
            if (!dropdownColumns[currentSheet][colName]) dropdownColumns[currentSheet][colName] = [];
            dropdownColumns[currentSheet][colName].push(newOption);
            localStorage.setItem('dropdownColumns', JSON.stringify(dropdownColumns));

            // Update cell value
            cell.querySelector('select').value = newOption;
            if (!cell.classList.contains('edited-cell')) {
              cell.classList.add('edited-cell');
            }
            document.getElementById('saveBtn').disabled = false;
          }
        });

        // Event: Edit selected option
        editOptionBtn.addEventListener('click', () => {
          const currentOption = select.value;
          if (!currentOption) {
            alert("Please select an option to edit.");
            return;
          }
          const newValue = prompt("Edit option:", currentOption);
          if (newValue && newValue !== currentOption) {
            if (uniqueValues.includes(newValue)) {
              alert("This value already exists.");
              return;
            }

            // Update the option in dropdown
            const selectedOption = [...select.options].find(opt => opt.value === currentOption);
            selectedOption.value = newValue;
            selectedOption.textContent = newValue;

            // Update dropdownColumns
            const index = dropdownColumns[currentSheet][colName].indexOf(currentOption);
            if (index > -1) {
              dropdownColumns[currentSheet][colName][index] = newValue;
            }
            localStorage.setItem('dropdownColumns', JSON.stringify(dropdownColumns));

            // Also update all rows using this value
            document.querySelectorAll(`#residentTable tbody tr`).forEach(row => {
              const cell = row.querySelector(`td:nth-child(${cell.cellIndex + 1})`);
              if (cell && cell.querySelector('select')?.value === currentOption) {
                cell.querySelector('select').value = newValue;
                if (!cell.classList.contains('edited-cell')) {
                  cell.classList.add('edited-cell');
                }
              }
            });

            document.getElementById('saveBtn').disabled = false;
          }
        });

        // Save changes on select change
        select.addEventListener('change', () => {
          if (!cell.classList.contains('edited-cell')) {
            cell.classList.add('edited-cell');
          }
          document.getElementById('saveBtn').disabled = false;
        });

        // Replace cell content
        cell.innerHTML = '';
        cell.appendChild(wrapper);

        return;
      }


      // Date Column Handling
      if (isDateColumn(colName)) {
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.className = 'date-input';
        dateInput.value = cell.innerText.trim();

        cell.innerHTML = '';
        cell.appendChild(dateInput);

        dateInput.addEventListener('change', () => {
          if (!cell.classList.contains('edited-cell')) {
            cell.classList.add('edited-cell');
          }
          document.getElementById('saveBtn').disabled = false;
        });
        return;
      }

      // Time Column Handling
      if (isTimeColumn(colName)) {
        const timeInput = document.createElement('input');
        timeInput.type = 'time';
        timeInput.className = 'time-input';
        timeInput.value = cell.innerText.trim();

        cell.innerHTML = '';
        cell.appendChild(timeInput);

        timeInput.addEventListener('change', () => {
          if (!cell.classList.contains('edited-cell')) {
            cell.classList.add('edited-cell');
          }
          document.getElementById('saveBtn').disabled = false;
        });
        return;
      }

      // Numeric Column Handling
      if (isNumericColumn(colName)) {
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
        return;
      }

      // Regular Text Column Handling
      cell.contentEditable = 'true';
      cell.addEventListener('input', () => {
        if (!cell.classList.contains('edited-cell')) {
          cell.classList.add('edited-cell');
        }
        document.getElementById('saveBtn').disabled = false;
      });

      cell.onbeforeinput = (e) => {
        if (isNumericColumn(colName)) {
          const allowedInput = /^[\d\b]+$/.test(e.data || '');
          if (!allowedInput && e.data !== null) {
            e.preventDefault();
          }
        }
      };
    });
  });

  // Inject button styles dynamically
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




function disableEditing(resetOnly = false) {
  const rows = document.querySelectorAll('#residentTable tbody tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    cells.forEach((cell, index) => {
      if (index === 0 || index === 1) return;
      const editableSpan = cell.querySelector('.editable-number');
      if (editableSpan) {
        const value = editableSpan.innerText;
        cell.innerHTML = value;
      } else {
        cell.contentEditable = 'false';
      }
    });
  });
  if (!resetOnly) {
    document.getElementById('saveBtn').disabled = true;
    isEditing = false;
    document.getElementById('editBtn').classList.remove('hidden');
  }
}

