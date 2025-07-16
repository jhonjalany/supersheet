
let sheetDataMap = {}; // { "Sheet1": [...], "Sheet2": [...] }
let residentData = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 10;
const visibleColumns = ['No.'];
const optionalColumns = [];
let sortColumn = null;
let sortDirection = 'asc';
let fixedSecondColumn = '';
let lastAddedColumnIndex = 1;
let isEditing = false;
let idColumn = 'ID'; // Will be set dynamically
// For Delete Functionality
let selectedRowForDelete = null;
let selectedRowIndex = -1;
let editedCells = {}; // <-- Add this
let conditionalFormatting = {}; // { "Sheet1": [rules], "Sheet2": [...] }
const dropdownColumns = {}; // { "Sheet1": { "Status": ["Active", "Inactive"], ... }, ... }

function ensureUniqueID(data, idField = 'ID') {
  const seenIDs = {};
  return data.map(item => {
    let id = item[idField];
    if (!id || seenIDs[id]) {
      let counter = 1;
      while (seenIDs[`${id}_${counter}`]) counter++;
      id = `${id || 'temp'}_${counter}`;
    }
    seenIDs[id] = true;
    item[idField] = id;
    return item;
  });
}


