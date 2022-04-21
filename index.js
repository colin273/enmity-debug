const { hostname } = require("os");
const { createInterface } = require("readline");
const { WebSocketServer } = require("ws");
const { red, bold: { blue } } = require("ansi-colors");

// Keep track of whether we need to log an additional empty line
let isPrompting = false;


// Utility functions for more visually pleasing logs
const colorLog = (data, source, color) => {
  if (isPrompting) {
    console.log(); // get out of user input area
  }
  console.log(color(`[${source}] `) + data);
}

const debuggerLog = (data) => colorLog(data, "Debugger", blue);

const debuggerError = (err) => {
  colorLog(red("Error"), "Debugger", red.bold);
  console.error(err);
}


// Create REPL UI
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = () => {
  isPrompting = true;
  rl.prompt();
}

rl.on("line", (input) => {
  try {
    isPrompting = false;
    globalWs.send(input);
  } catch (e) {
    debuggerError(e);
    prompt();
  }
});

rl.on("close", () => {
  debuggerLog("Closing debugger");
  process.exit();
});


// Create websocket
let globalWs;
const wss = new WebSocketServer({ port: 9090 });

// Add server connection handler and websocket event handlers
wss.on("connection", (ws) => {
  debuggerLog("Connected to Discord over websocket, starting debug session");

  ws.on("message", (data) => {
    try {
      colorLog(JSON.parse(data).message, "Discord", blue);
    } catch (e) {
      debuggerError(e);
    }
    prompt();
  });

  ws.on("close", () => {
    debuggerLog("Websocket has been closed");
    isPrompting = false;
    rl.close();
  });

  globalWs = ws;
});


// Display welcome messages
console.log("Welcome to the unofficial Enmity debugger.");
console.log("Press Ctrl+C at any time to exit.");

console.log(`
Connect to this debugger from Discord on your iOS device
by typing the following slash command in the chat box:

  /websocket host:${hostname()}:9090
`);

debuggerLog("Ready to connect");
