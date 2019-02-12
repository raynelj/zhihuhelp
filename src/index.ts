// Modules to control application life and create native browser window
import Electron from 'electron'
import CommonUtil from '~/src/library/util/common'
import PathConfig from '~/src/config/path'
import fs from 'fs'
import _ from 'lodash'

let { app, BrowserWindow, ipcMain, session } = Electron
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
    // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
        // 禁用web安全功能 --> 个人软件, 要啥自行车
    webPreferences: {
            // 开启 DevTools.
      devTools: true,
            // 禁用同源策略, 允许加载任何来源的js
      webSecurity: false,
            // 允许 https 页面运行 http url 里的资源
      allowRunningInsecureContent: true
    }
  })

    // and load the index.html of the app.
  mainWindow.loadFile('index.html')
    // mainWindow.loadURL('https://www.zhihu.com')
    // 打开控制台
  mainWindow.webContents.openDevTools()

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
  mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
    mainWindow = null
  })

    // 设置ua
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
    callback({ cancel: false, requestHeaders: details.requestHeaders })
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('start', async () => {
  console.log('开始工作')
  let cookieContent = ''
  await new Promise((resolve, reject) => {
        // 获取页面cookie
    session.defaultSession.cookies.get({}, (error, cookieList) => {
      for (let cookie of cookieList) {
        cookieContent = `${cookie.name}=${cookie.value};${cookieContent}`
      }
            // 顺利获取cookie列表
      console.log('cookieContent=>', cookieContent)
      resolve()
    })
  })
  // 将cookie更新到本地配置中
  let localConfig = CommonUtil.getLocalConfig()
  _.set(localConfig, ['requestConfig', 'cookie'], cookieContent)
  fs.writeFileSync(PathConfig.localConfigUri, JSON.stringify(localConfig, null, 4))
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.