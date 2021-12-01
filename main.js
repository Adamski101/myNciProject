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
    title: 'Scan Your Network',
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

ipcMain.on('start:notepad', (event,args) =>{ 
  startProgram()
})


ipcMain.on('stop:scan', (event,args) =>{ 
 console.log("ipc Stop Scan")



})

ipcMain.on('list:files', (event,args) =>{
  console.log(args);
  getDir()
 
})
ipcMain.on('get:webpage', (event,args) =>{
  console.log(args);
  getWebPage()
 
})


async function sendCommand(args){
  
  console.log("------------------")
 //this works let ar = await [args.type,args.target]
  //let ar = await ['-sS','207.154.224.208' ]
  //let ar = ['-h']
  let arg1=args.target || '-c 10'
  let arg2=args.type || '-f port 80'
console.log (arg1)
console.log (arg2)

  let ar = await ['-i 4',args.target,args.type]

  if(args.as ==2){
    // ar=["-i 4", "-c 5","-f tcp port 80"]
    //ar=['-i 4',"-c 5", "-f tcp port 443"]

  } else {
    // ar=['-i 4',"-f tcp port 443"]



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

function getWebPage(){    
  const { BrowserWindow } = require('electron')
  const child = new BrowserWindow({ modal: true, show: false })
  child.loadURL('https://app.qr-code-generator.com/manage/?aftercreate=1&count=1')
  child.once('ready-to-show', () => {
    child.show()
  })  
}

function startProgram(){ 
  const child = require('child_process').execFile;
  const executablePath = "C:\\Windows\\System32\\notepad.exe";
  const parameters = [];

  // const executablePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  // const parameters = ["--incognito"];

  child(executablePath, parameters, function(err, data) {
      console.log(err)
      console.log(data.toString());
  });   
  
}

async function getDir(args){
  const ar = await ['-al' ]
  //console.log(ar);
  
  const ls = spawn('ls');
  ls.stdout.on('data', (data) => {    
    console.log(`${data}`)      
    mainWindow.webContents.send("cmd:done", `${data}`);    
  });
  
  ls.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  
  ls.on('close', (code) => {
   console.log(`child process exited with code ${code}`);
  });
}

app.allowRendererProcessReuse = true
