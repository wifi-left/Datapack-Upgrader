# Datapack Updater
The project aims to upgrade your commands from 1.20.4 to the newer version of Minecraft (1.20.5).

## Features
I'm still working on it.
**Support Commands**
 - [ ] `/give`
 - [ ] `/item`
 - [ ] `/clear`
 - [ ] `/setblock` for Loot Tables and other changes 
 - [ ] `/fill` for Loot Tables and other changes
 - [ ] Other commands only for selector(Texts that start with `@` like `@a[nbt={...}]`)

## Get to start
### Use in command mode:
```bash
node index.js -c "<Your commands here>"
```
For example
```bash
node index.js -c "/give @s[distance=0..5] diamond_sword{Enchantments:[{id:\"sweeping\",lvl:1s}],display:{Name:'\"sss\"',color:114514,Lore:['\"Hello world!\\u00a7a1\"','\"\\u00a7cThis is wifi_left!\"']},Unbreakable:1b,Damage:1s}"
```
The output:
```mcfunction
/give @s[distance=0..5] diamond_sword[enchantments={levels:{sweeping_edge:1s}},custom_name="\"sss\"",lore=["\"Hello world!\\u00a7a1\"","\"\\u00a7cThis is wifi_left!\""],dyed_color={rgb:114514},unbreakable={},damage=1]
```
### Transform function files
```bash
node index.js -I "<Your file path>"
```
For example
```bash
node index.js -I test.mcfunction
```