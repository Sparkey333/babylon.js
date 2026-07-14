/**
 * Electron main process — loads the Vite-built cockpit for local Mac install.
 * Packaged via electron-builder into a .dmg (run package:mac on this Mac).
 */
const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const isDev = !app.isPackaged;

function createWindow() {
    const win = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        backgroundColor: "#050510",
        title: "Master AI Command Center",
        titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
        },
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });

    if (isDev) {
        void win.loadURL(process.env.MASTER_AI_DASHBOARD_URL ?? "http://localhost:1347");
    } else {
        void win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
    }
}

app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
