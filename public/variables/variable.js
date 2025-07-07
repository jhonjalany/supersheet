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