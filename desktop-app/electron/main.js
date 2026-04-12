const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Esperar un momento y luego cargar la aplicación
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:5173');
    
    // Abrir DevTools para depuración
    mainWindow.webContents.openDevTools();
  }, 2000);

  // Manejar errores de carga
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Error al cargar la aplicación:', errorCode, errorDescription);
    
    // Mostrar página de error
    mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h1>Error al cargar la aplicación</h1>
          <p>No se pudo conectar al servidor de desarrollo.</p>
          <p>Asegúrate de que Vite esté corriendo en http://localhost:5173</p>
          <button onclick="location.reload()">Reintentar</button>
        </body>
      </html>
    `));
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
