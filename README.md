# Enmity Debugger

A (relatively) simple remote debugger for [Enmity](https://enmity.app). This connects over a websocket to the iOS Discord app with Enmity installed and allows you to execute JavaScript in the Discord app from the command line. The REPL in this debugger is a slightly modified version of the [default REPL in Node.js](https://nodejs.org/api/repl.html), including the same commands and some support for multi-line code snippets.

This began life as an interim debugger tool for me while I waited for the release of a new official Enmity debugger, but it has since become my preferred method of debugging Enmity plugins. (I'm biased though.) If this particular debugger doesn't meet your needs, there are similar tools by other developers:

- [enmity-devsocket](https://github.com/Beefers/enmity-devsocket) - a full GUI debugger, featuring a server and a browser client. The client includes a code editor that allows for easy writing and running of many lines of code at once. Enmity's console output is displayed next to the editor.
- [debug-ws-server](https://github.com/Aliucord/debug-ws-server) - made for [Aliucord](https://github.com/Aliucord), but compatible with Enmity. This CLI debugger is written in Go and doesn't have any builds published on GitHub, so you'll have to compile it yourself.
- [Legacy Enmity debugger](https://github.com/beerpiss/enmitydebugger) - the old official Enmity debugger. It's a GUI app built on [Flutter](https://flutter.dev), which makes it significantly heavier than the other debuggers I've tried. My CLI's behavior is loosely based on the behavior of this one. The linked repo is not where this debugger was developed, but it uses GitHub Actions to generate ready-to-use builds.

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
