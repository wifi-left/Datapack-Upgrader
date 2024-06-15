##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
##
scoreboard players set zombie.round board 11

execute as @e[tag=pve.spawn.rabbit,limit=2,sort=random] at @s run summon rabbit ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",RabbitType:99,ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],Health:3,attributes:[{base:0.4d,id:"generic.movement_speed"},{base:5d,id:"generic.attack_damage"},{base:3d,id:"generic.attack_speed"},{base:3d,id:"generic.max_health"}]}
execute as @a[team=play.zombie,gamemode=adventure] as @e[tag=pve.spawn.rabbit,limit=1,sort=random] at @s run summon rabbit ~ ~ ~ {RabbitType:99,Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],Health:3,attributes:[{base:0.4d,id:"generic.movement_speed"},{base:5d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"},{base:3d,id:"generic.max_health"}]}

## WARNING: Unsupport transformation
execute as @e[tag=pve.zombie] run data merge entity @s {PersistenceRequired:1b,ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],HandDropChances:[0.0f,0.0f]}
scoreboard players set zombie.state state 1

