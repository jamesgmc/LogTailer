const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startTailing: (filePath) => ipcRenderer.send('start-tailing', filePath),
  onLogLine: (callback) => ipcRenderer.on('log-line', (event, value) => callback(value)),
  onLogError: (callback) => ipcRenderer.on('log-error', (event, value) => callback(value)),
  onTailingStarted: (callback) => ipcRenderer.on('tailing-started', (event, value) => callback(value))
});
