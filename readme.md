# Datapack Updater
**English** | [简体中文](./readme.zh.md)

The project aims to upgrade your commands from 1.20.4 to the newer version of Minecraft (1.20.5).

## Features
I'm still working on it.

**Support Commands**
 - [x] `/give`
 - [x] `/item`
 - [x] `/clear`
 - [x] `/summon` for 'Firework' and 'Item'
 - [x] `/setblock`
 - [x] `/fill`
 - [x] `/execute if block`
 - [ ] `/execute if data`
 - [ ] `/data`
 - [x] Other commands only for selector(Texts that start with `@` like `@a[nbt={...}]`)
 - [ ] Loot Table
 - [ ] Item modifier

## Get to start
### Download the source code
You can simply download zip file from GitHub.

Or use git command:
```bash
git clone https://github.com/wifi-left/Datapack-Upgrader.git
```

You must install Node.js to use the project.

### Use in command mode:
```bash
node index.js -c "<Your commands here>"
```
For example
```bash
node index.js -c "give @s[distance=0..5] diamond_sword{Enchantments:[{id:\"sweeping\",lvl:1s}],display:{Name:'\"sss\"',color:114514,Lore:['\"Hello world!\\u00a7a1\"','\"\\u00a7cThis is wifi_left!\"']},Unbreakable:1b,Damage:1s}"
```
The output:
```mcfunction
give @s[distance=0..5] diamond_sword[enchantments={levels:{sweeping_edge:1s}},custom_name="\"sss\"",lore=["\"Hello world!\\u00a7a1\"","\"\\u00a7cThis is wifi_left!\""],dyed_color={rgb:114514},unbreakable={},damage=1]
```
### Transform function files
Save to file
```bash
node index.js -O "<Output file path>" -I "<Your file path>"
```
Or print in terminal
```bash
node index.js -I "<Your file path>"
```
For example
```bash
node index.js -I test.mcfunction
```
