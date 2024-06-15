##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
# 544 -20 -128
tellraw @a[team=play.zombie] ["\n\u00a7c    魔王降临...\n"]
scoreboard players set zombie.round board 28

execute if score zombie.type board matches 1 run summon wither 544 -20 -128 {Tags:["pve.zombie"],Health:1000,Attributes:[{Base:0.5d,Name:"generic.movement_speed"},{Base:1000d,Name:"generic.max_health"}],DeathLootTable:"minecraft:empty",CustomName:'"\\u00a7c\\u00a7l魔王"'}
execute if score zombie.type board matches 2 run summon wither 544 -20 -128 {Tags:["pve.zombie"],Health:2000,Attributes:[{Base:0.5d,Name:"generic.movement_speed"},{Base:2000d,Name:"generic.max_health"}],DeathLootTable:"minecraft:empty",CustomName:'"\\u00a7c\\u00a7l魔王"'}
function minecraft:zombieever/rounds/boss_xb

