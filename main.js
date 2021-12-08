const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron')
const { spawn} = require('child_process')

const log = require('electron-log')

// Set env
process.env.NODE_ENV = 'development'

const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let mainWindow

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'Adams Network Scanner',
    width: isDev ? 800 : 500,
    height: 600,
    icon: './assets/icons/icon.png',
    resizable: isDev ? true : false,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.loadFile('./app/index.html')
}

app.on('ready', () => {
  createMainWindow()

  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)
})

const menu = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    role: 'fileMenu',
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
]

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

ipcMain.on('send:cmd', (event,args) =>{
  console.log(args);
  sendCommand(args);
 
})


ipcMain.on('stop:scan', (event,args) =>{ 
 console.log("ipc Stop Scan")



})

async function sendCommand(args){
  
  console.log("------------------")
 //this works let ar = await [args.type,args.target]
  //let ar = await ['-sS','207.154.224.208' ]
  //let ar = ['-h']
  // let arg1=args.target || '-c 10'
  // let arg2=args.type || '-f port 443'
// console.log (arg1)
// console.log (arg2)

  // let ar = await ['-i 4',args.target,args.type]
  let ar = await ['-i 4','-c5','-f port 80']


  if(args.as ==3){
    ar = await ['-i 4','-c5','-f port 443']

  } else {
    ar = await ['-i 4','-c5','-f port 80']



  }


  
  console.log(ar);
  
  const nmap = spawn('Wireshark/tshark.exe', ar);
  nmap.stdout.on('data', (data) => {
    console.log(`${data}`)      
    mainWindow.webContents.send("cmd:done", `${data}`);
    
  });
  
  nmap.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  
  nmap.on('close', (code) => {
   console.log(`child process exited with code ${code}`);
  });
}



app.allowRendererProcessReuse = true
