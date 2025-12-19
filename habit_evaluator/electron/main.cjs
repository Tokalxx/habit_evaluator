const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const dataPath = path.join(app.getPath("userData"), "habit.json");
console.log(dataPath);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile("dist/index.html");
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("update-item", (event, updatedItem) => {
  try {
    let items = [];
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, "utf8");
      items = JSON.parse(data);
    }

    const index = items.findIndex((item) => item.id === updatedItem.id);
    if (index !== -1) {
      items[index] = updatedItem;
      fs.writeFileSync(dataPath, JSON.stringify(items, null, 2));
      return updatedItem;
    }
    return null;
  } catch (error) {
    console.error("Failed to update item:", error);
    throw error;
  }
});

ipcMain.handle("delete-item", (event, itemId) => {
  try {
    let items = [];
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, "utf8");
      items = JSON.parse(data);
    }
    const newItems = items.filter((item) => item.id !== itemId);
    fs.writeFileSync(dataPath, JSON.stringify(newItems, null, 2));
    return true;
  } catch (error) {
    console.error("Failed to delete item:", error);
    throw error;
  }
});

ipcMain.handle("create-item", (event, newItem) => {
  try {
    let items = [];
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, "utf8");
      items = JSON.parse(data);
    }
    newItem.id = Date.now();
    items.push(newItem);
    fs.writeFileSync(dataPath, JSON.stringify(items, null, 2));
    return newItem;
  } catch (error) {
    console.error("Failed to create item:", error);
    throw error;
  }
});

ipcMain.handle("read-items", () => {
  try {
    let items = [];
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, "utf8");
      items = JSON.parse(data);
    }

    return items;
  } catch (error) {
    console.error("Failed to read items:", error);
    return [];
  }
});
