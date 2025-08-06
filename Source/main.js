// Modules to control application life and create native browser window
const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');
const url = require('node:url');

// Check all command line args for any arg ending with .pdf and not starting with --
function getPDFArg(argv, isPackaged, workingDirectory) {
    let pdfArg;

    for (let i = 1; i < argv.length; i++) {
        const arg = argv[i];
        if (
            typeof arg === 'string' &&
            arg.toLowerCase().endsWith('.pdf') &&
            !arg.startsWith('--')
        ) {
            pdfArg = arg;
            break;
        }
    }

    if (!pdfArg) return null;

    if (!path.isAbsolute(pdfArg)) {
        pdfArg = path.resolve(workingDirectory || process.cwd(), pdfArg);
    }

    return pdfArg;
}


let mainWindow;

// Create a BrowserWindow to load a specific PDF
function createWindowWithPdf(pdfPath) {
    const pdfUrl = pdfPath ? url.pathToFileURL(pdfPath).href : '';
    console.log(`Opening PDF: ${pdfPath}`);

    const win = new BrowserWindow({
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });


    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' }; // Don't open in Electron
    });

    const viewerPath = path.join(__dirname, 'viewer.html');
    const fullUrl = `file://${viewerPath}?file=${encodeURIComponent(pdfUrl)}`;
    win.loadURL(fullUrl);
 

    // Show DevTools
    //win.webContents.openDevTools();  

}

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, argv, workingDirectory) => {
        // Focus existing window
        const pdfPath = getPDFArg(argv, app.isPackaged, workingDirectory);
        if (pdfPath) {
            createWindowWithPdf(pdfPath);
        }
    });

    let pdfOpenedBeforeReady = null;
    app.on('open-file', (event, filePath) => {
        event.preventDefault();
        if (app.isReady()) {
            createWindowWithPdf(filePath);
        } else {
            pdfOpenedBeforeReady = filePath;
        }
    });

    app.whenReady().then(() => {
        if (pdfOpenedBeforeReady) {
            const pdfPath = pdfOpenedBeforeReady;
            createWindowWithPdf(pdfPath);
        } else {
            
            const pdfPath = getPDFArg(process.argv, app.isPackaged);
            createWindowWithPdf(pdfPath);
        }

        //app.on('activate', () => {
        //    if (BrowserWindow.getAllWindows().length === 0) createWindow();
        //});
    });

    app.on('window-all-closed', () => {
        app.quit();
    });
}

