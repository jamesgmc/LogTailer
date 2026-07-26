const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Tail } = require('tail');

let mainWindow;
let currentTail = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle tailing a file
ipcMain.on('start-tailing', (event, filePath) => {
  if (currentTail) {
    currentTail.unwatch();
    currentTail = null;
  }

  try {
    currentTail = new Tail(filePath, { fromBeginning: true }); // Also load some existing content if small? Or just tail. The default tail gets new lines. Let's use default tail behavior, or fromBeginning: false. We will let it default (from end). Actually tail defaults to from end.
    
    currentTail.on('line', (data) => {
      mainWindow.webContents.send('log-line', data);
    });

    currentTail.on('error', (error) => {
      mainWindow.webContents.send('log-error', error.toString());
    });
    
    // Notify renderer that tailing started successfully
    mainWindow.webContents.send('tailing-started', filePath);
  } catch (err) {
    mainWindow.webContents.send('log-error', 'Error starting tail: ' + err.message);
  }
});
