import { hostname } from "os";
import repl from "repl";
import { WebSocketServer } from "ws";
import { mkdirSync, writeFile } from "fs";
import { join } from "path";
import colors from "ansi-colors";
const { cyan, red, yellow, bold: { blue } } = colors;

const DONE_SIGNAL = "done";
const DUMP_SEPARATOR = ":";
const DUMPED_PATH = "./dumped";

// Whether the prompt is currently open to the user,
// and thus whether any messages from the websocket
// need to be printed with a preceding newline
// to get out of the prompt line.
let isPrompting = false;

let isDumping = false;

// Utility functions for more visually pleasing logs
// Get out of user input area first if prompt is currently being shown
const colorize = (data, source, color) => color(`[${source}] `) + data;
const safeLog = (data) => console.log((isPrompting ? "\n" : "") + data);

const discordColorize = (data) => {
  let { message, level } = JSON.parse(data);
  // Normal logs don't need extra colorization
  switch (level) {
    case 0: // Info
      message = cyan(message);
      break;
    case 2: // Warning
      message = yellow(message);
      break;
    case 3: // Error
      message = red(message);
      break;
  }
  return colorize(message, "Discord", blue);
};
const discordLog = (data) => safeLog(discordColorize(data));

const debuggerColorize = (data) => colorize(data, "Debugger", blue);
const debuggerLog = (data) => safeLog(debuggerColorize(data));
const debuggerError = (err, isReturning) => {
  safeLog(colorize(red("Error"), "Debugger", red.bold));
  if (isReturning) {
    return err;
  }
  console.error(err);
};


const dumpModules = (ws) => {
  debuggerLog("Dumping modules...");
  isDumping = true;  // don't log modules as they're returned

  // Create folder
  try {
    mkdirSync(DUMPED_PATH);
  } catch {
    // Dumped folder already exists.
  }

  // Start dumping modules
  ws.send(`
    const { inspect } = enmity.modules.getByProps("inspect");
    for (const id in modules) {
      console.log(id + "${DUMP_SEPARATOR}" + inspect(modules[id].publicModule?.exports, {
        showHidden: true,
        getters: true,
        maxArrayLength: null,
        maxStringLength: null
      }));
    }
    console.log("${DONE_SIGNAL}");
  `);
  // Dumped modules (as console logs) will be received and handled in receiveDumpedModule()
};

const receiveDumpedModule = (data) => {
  const { message } = JSON.parse(data);
  if (message.trim() === DONE_SIGNAL) {
    // Stop receiving dumped modules, return to normal REPL mode
    isDumping = false;
    debuggerLog("Finished dumping modules.");
  } else {
    // Save dumped module to <ID>.txt in folder for dumped modules
    const splitIdx = message.indexOf(DUMP_SEPARATOR);
    const id = message.slice(0, splitIdx);
    const moduleStr = message.slice(splitIdx + 1);
    try {
      writeFile(join(DUMPED_PATH, `${id}.txt`), moduleStr, ()=>{});
    } catch (err) {
      console.error(err);
    }
  }
}


// Display welcome message and basic instructions
console.log("Welcome to the unofficial Enmity debugger.")
console.log("Press Ctrl+C to exit.")
console.log(`Connect to this debugger from Discord on your iOS device
by typing the following slash command in the chat box:

  /websocket host:${hostname()}:9090
`);

// Create websocket server and REPL, and wait for connection
const wss = new WebSocketServer({ port: 9090 });
wss.on("connection", (ws) => {
  debuggerLog("Connected to Discord over websocket, starting debug session");

  isPrompting = false; // REPL hasn't been created yet
  isDumping = false;
  let finishCallback;  // Callback from REPL's eval() to write to stdout

  // Handle logs returned from Discord client via the websocket
  ws.on("message", (data) => {
    if (isDumping) {
      receiveDumpedModule(data);
    } else {
      try {
        if (finishCallback) {
          // write data to stdout and display repl's prompt again
          finishCallback(null, data);
          finishCallback = undefined;
        } else {
          discordLog(data);
        }
      } catch (e) {
        debuggerError(e, false);
      }
      isPrompting = true;
      rl.displayPrompt();
    }
  });

  // Create the REPL
  const rl = repl.start({
    eval: (input, ctx, filename, cb) => {
      try {
        if (!input.trim()) {
          cb();  // no output to write, just show the prompt again
        } else {
          isPrompting = false;  // don't need to get out of prompt area on print
          ws.send(input);
          // Websocket's message handler will call this to show the prompt again
          finishCallback = cb;
        }
      } catch (e) {
        cb(e);  // display error immediately
      }
    },
    writer: (data) => {
      return (data instanceof Error) ? debuggerError(data, true) : discordColorize(data);
    }
  });

  isPrompting = true; // Now the REPL exists and is prompting the user for input
  
  rl.on("close", () => {
    debuggerLog("Closing debugger, press Ctrl+C to exit");
  });

  rl.defineCommand("dump", {
    help: "Dump modules from Discord to your computer",
    action: () => {
      dumpModules(ws);
    }
  });

  ws.on("close", () => {
    debuggerLog("Websocket has been closed");
    isPrompting = false;
    rl.close();
  });
});

debuggerLog("Ready to connect");
