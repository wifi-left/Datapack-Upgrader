##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
##
# 544 -20 -128
tellraw @a[team=play.zombie] ["\n\u00a7c    魔王降临...\n"]
scoreboard players set zombie.round board 28

execute if score zombie.type board matches 1 run summon wither 544 -20 -128 {Tags:["pve.zombie"],Health:1000,DeathLootTable:"minecraft:empty",CustomName:'"\\u00a7c\\u00a7l魔王"',attributes:[{base:0.5d,id:"generic.movement_speed"},{base:1000d,id:"generic.max_health"}]}
execute if score zombie.type board matches 2 run summon wither 544 -20 -128 {Tags:["pve.zombie"],Health:2000,DeathLootTable:"minecraft:empty",CustomName:'"\\u00a7c\\u00a7l魔王"',attributes:[{base:0.5d,id:"generic.movement_speed"},{base:2000d,id:"generic.max_health"}]}
function minecraft:zombieever/rounds/boss_xb


