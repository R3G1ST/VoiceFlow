const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

let mainWindow;

function createWindow() {
  console.log('🚀 Creating Electron window...');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    backgroundColor: '#36393f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    // Показываем окно сразу
    show: true,
  });

  // Открываем DevTools для отладки
  mainWindow.webContents.openDevTools();

  console.log('📁 Loading from:', __dirname);

  // В режиме разработки загружаем с Vite сервера
  // Проверяем запущен ли Vite dev сервер (порт 5173)
  const isDev = process.env.NODE_ENV === 'development' || process.env.DEV === 'true';
  
  if (isDev) {
    console.log('🌐 Development mode - loading from Vite dev server (http://localhost:5173)');
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // Загружаем index.html из dist папки
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('📄 Loading file:', indexPath);
    
    if (fs.existsSync(indexPath)) {
      console.log('✅ File exists, loading...');
      mainWindow.loadFile(indexPath);
    } else {
      console.error('❌ File NOT found:', indexPath);
      console.log('🌐 Trying to load from server...');
      mainWindow.loadURL('http://77.105.133.95:5173');
    }
  }

  mainWindow.on('closed', () => {
    console.log('❌ Window closed');
    mainWindow = null;
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Page loaded successfully');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Page load failed:', errorCode, errorDescription);
  });
}

app.whenReady().then(() => {
  console.log('⚡ App ready');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  console.log('👋 All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('close-window', () => {
  mainWindow?.close();
});
