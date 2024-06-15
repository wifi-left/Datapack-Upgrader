##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
##
# summon marker ~ ~ ~ {Tags:["pve","pve.spawn","pve.spawn.stongholdboss"]}
execute as @e[tag=pve.spawn.stongholdboss,limit=2,sort=random] at @s run summon vindicator ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],HandItems:[{id:"minecraft:iron_axe"},{}],attributes:[{base:0.25d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}
execute as @e[tag=pve.spawn.stongholdboss,limit=2,sort=random] at @s run summon vindicator ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],HandItems:[{id:"minecraft:iron_axe"},{}],attributes:[{base:0.25d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}
execute if score zombie.type board matches 2 as @e[tag=pve.spawn.stongholdboss,limit=1,sort=random] at @s run summon pillager ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],HandItems:[{id:"minecraft:crossbow"},{}],attributes:[{base:0.25d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}


## WARNING: Unsupport transformation
execute as @e[tag=pve.zombie] run data merge entity @s {PersistenceRequired:1b,ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],HandDropChances:[0.0f,0.0f]}

scoreboard players set zombie.state state 1
scoreboard players set zombie.round board 26

