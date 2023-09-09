# Enmity Debugger

A simple remote debugger console for [Enmity](https://enmity.app). This connects over a websocket to the iOS Discord app with Enmity installed, so you can execute JavaScript in Discord from the command line.

The prompt interface is [Node.js's REPL](https://nodejs.org/api/repl.html), extended to send input over the websocket instead of executing JS locally. All commands from Node's REPL are automatically supported, including `.editor` and `.load`.

## Installing

Prerequisites:

- git
- Node.js
- pnpm (other package managers should also work)

Run the following commands in the terminal:

```bash
git clone https://github.com/colin273/enmity-debug
cd enmity-debug
pnpm i
```

The debugger's dependencies are minimal and have no dependencies of their own:

- `ws` for the websocket server
- `ansi-colors` for coloring the output

## Running

Run this command in the `enmity-debug` folder to start the debugger:

```bash
node .
```

Then connect the Discord app, with Enmity installed, on your iOS device to the debugger. There are two ways to do this:

- Enmity settings: enable "Automatically connect to debug websocket" and fill in the hostname and port number (`local.ip.here:9090`) in the "Debug IP" field.
- Run this slash command: `/websocket host:local.ip.here:9090`

If everything goes smoothly, you should see a toast in the iOS app that says `Connected to the websocket server.` At the same time, the debugger CLI will print `Connected to Discord over websocket, starting debug session`. If you get an error, then you need to make sure that both devices are on the same network and can connect to one another.

At this point, you can run JavaScript through the debugger, much like a browser's console. All input executes in Discord, and the debugger displays the output.

## React Developer Tools

If you have the **developer** version of Enmity, you can connect `react-devtools` to Enmity to view the React tree.

1. Install `react-devtools` from npm: `pnpm add -g react-devtools`
2. Start the devtools: `react-devtools`
3. Start and connect this debugger.
4. In the debugger, run this JavaScript:

```js
connectToDevTools({ host: "local.ip.here", port: 8097 })
```

The React tree of the Discord app should now appear in the React devtools window.

## Quitting

Once you have finished debugging and closed the REPL, press `Ctrl+C` on your keyboard to quit the CLI.

## Similar projects

- [enmity-devsocket](https://github.com/Beefers/enmity-devsocket): A GUI debugger for Enmity, consisting of a browser client and a CLI server.
- [debug-ws-server](https://github.com/Aliucord/debug-ws-server): [Aliucord](https://github.com/Aliucord)'s websocket debugger.
- [vdebug](https://github.com/aeongdesu/vdebug): [Vendetta](https://github.com/vendetta-mod)'s debugger, forked from this project with Vendetta-specific changes.