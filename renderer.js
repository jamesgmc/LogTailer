const dropZone = document.getElementById('drop-zone');
const logContainer = document.getElementById('log-container');
const logOutput = document.getElementById('log-output');
const currentFileDisplay = document.getElementById('current-file');
const closeFileBtn = document.getElementById('close-file-btn');
const clearLogsBtn = document.getElementById('clear-logs-btn');
const appBody = document.body;

// Drag and Drop Events
appBody.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  appBody.classList.add('drag-over');
});

appBody.addEventListener('dragleave', (e) => {
  e.preventDefault();
  e.stopPropagation();
  appBody.classList.remove('drag-over');
});

appBody.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  appBody.classList.remove('drag-over');

  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    const filePath = file.path;
    
    if (filePath) {
      window.electronAPI.startTailing(filePath);
    }
  }
});

// Close File Event
closeFileBtn.addEventListener('click', () => {
  logContainer.classList.add('hidden');
  dropZone.classList.remove('hidden');
  logOutput.innerHTML = '';
});

// Clear Logs Event
clearLogsBtn.addEventListener('click', () => {
  logOutput.innerHTML = '';
});

// IPC Listeners
window.electronAPI.onTailingStarted((filePath) => {
  dropZone.classList.add('hidden');
  logContainer.classList.remove('hidden');
  currentFileDisplay.textContent = filePath;
  logOutput.innerHTML = ''; // Clear previous logs
});

window.electronAPI.onLogLine((line) => {
  const lineElement = document.createElement('div');
  lineElement.className = 'log-line';
  
  // Basic rendering
  lineElement.textContent = line;
  
  logOutput.appendChild(lineElement);
  
  // Auto-scroll to bottom
  logOutput.scrollTop = logOutput.scrollHeight;
});

window.electronAPI.onLogError((error) => {
  const errorElement = document.createElement('div');
  errorElement.className = 'log-line log-error';
  errorElement.textContent = `[ERROR]: ${error}`;
  
  logOutput.appendChild(errorElement);
  logOutput.scrollTop = logOutput.scrollHeight;
});
