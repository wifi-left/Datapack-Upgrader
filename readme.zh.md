# Datapack Updater
[English](./readme.md) | **简体中文**

该项目旨在将您的命令从 1.20.4 升级到较新版本的 Minecraft (1.21)。

## 特点

**支持的命令**
 - [x] `/give`
 - [x] `/item`
 - [x] `/clear`
 - [x] `/summon` for 'Firework' and 'Item'
 - [x] `/setblock`
 - [x] `/fill`
 - [x] `/execute if block`
 - [x] `/execute if data`
 - [x] `/data`
 - [x] 选择器 (以 `@` 开头，比如 `@a[nbt={...}]`)
 - [ ] Loot Table
 - [ ] Item modifier

## 开始使用
```bash
Command Arguments:
[Commands 1] [Commands2] ...

Supported commands:
-h                                  Show help texts(This).
-i <input(File)> <Output File>      Transform a File.
    [-y]                            Overwrite the existed file.
-i <input(Folder)> <Output Folder>  Transform a Folder.
    [-y]                            Overwrite the existed file.
-debug                              Show debug messages
-c <commands>                       Transform a command. Use '\\n' to transform multiline commands.`);
```
### 下载源码
你可以直接从 GitHub 下载源码后启动

或者使用Git命令下载：
```bash
git clone https://github.com/wifi-left/Datapack-Upgrader.git
```

**你需要安装 Node.js 来使用本项目**

### 转换单个命令
```bash
node index.js -c "<Your commands here>"
```
比如
```bash
node index.js -c "give @s[distance=0..5] diamond_sword{Enchantments:[{id:\"sweeping\",lvl:1s}],display:{Name:'\"sss\"',color:114514,Lore:['\"Hello world!\\u00a7a1\"','\"\\u00a7cThis is wifi_left!\"']},Unbreakable:1b,Damage:1s}"
```
输出为：
```mcfunction
give @s[distance=0..5] diamond_sword[enchantments={levels:{sweeping_edge:1s}},custom_name="\"sss\"",lore=["\"Hello world!\\u00a7a1\"","\"\\u00a7cThis is wifi_left!\""],dyed_color={rgb:114514},unbreakable={},damage=1]
```

