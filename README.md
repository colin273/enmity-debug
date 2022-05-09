# Enmity Debugger

A (relatively) simple remote debugger for [Enmity](https://enmity.app). This connects to the iOS Discord app with Enmity installed over a websocket and allows you to execute JavaScript in the Discord app from the command line. 

There is an official (unreleased for now) Enmity debugger app in development, featuring a GUI with logs and a code editor for better ease of use. There is also an old version of the debugger built on [Flutter](https:flutter.dev) (builds are available to download [here](https://github.com/beerpiss/enmitydebugger)). However, I was unable to establish a websocket connection between my Mac and any of my iOS devices using the Flutter app, so I made my own debugger CLI using [Node.js](https://nodejs.org) and tried to mimic what little I know about the intended behavior of the official debugger as closely as possible.

## Installing

To install this debugger and its dependencies, run the following commands in the terminal:

```bash
git clone https://github.com/FifiTheBulldog/enmity-debug
cd enmity-debug
pnpm i
```

(The dependencies are minimal, by the way. The only third-party modules this debugger needs are `ws` for the websocket server and `ansi-colors` to make the console output look prettier. Neither of those have any dependencies of their own.)

## Running

To start the debugger, run this command from inside the `enmity-debug` folder:

```bash
node .
```

Then connect the Discord app, with Enmity installed, on your iOS device to the debugger using this slash command:

```
/websocket host:local.ip.here:9090
```

If everything goes smoothly, you should see a toast in the iOS app that says `Connected to the websocket server.` At the same time, the debugger CLI will print `Connected to Discord over websocket, starting debug session`. If you get an error, then you will need to check to make sure that both devices are on the same network and can connect to one another.

Once the debugger is connected to the iOS Discord app, you can begin debugging. Just like a console in a browser where you can evaluate JavaScript, the debugger can evaluate JavaScript in a similar environment and return the value. All console logs and return values of statements evaluated in the Discord app are printed to the console on your computer.

## Quitting

Once you have finished debugging and closed the debugger REPL, press `Ctrl+C` on your keyboard to quit the CLI.
