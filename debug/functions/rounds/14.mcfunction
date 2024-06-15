##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
##
# summon marker ~ ~ ~ {Tags:["pve","pve.spawn","pve.spawn.house"]}
execute if score zombie.type board matches 2 as @e[tag=pve.spawn.house,sort=random,limit=10] at @s run summon zombie ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],attributes:[{base:0.4d,id:"generic.movement_speed"},{base:5d,id:"generic.attack_damage"},{base:1.4d,id:"generic.attack_speed"}]}
execute if score zombie.type board matches 1 as @e[tag=pve.spawn.house,sort=random,limit=10] at @s run summon zombie_villager ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],attributes:[{base:0.3d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}
execute as @a[team=play.zombie,gamemode=adventure] as @e[tag=pve.spawn.house,limit=2,sort=random] at @s run summon zombie ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],attributes:[{base:0.3d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}

execute if score zombie.type board matches 2 as @a[team=play.zombie,gamemode=adventure] as @e[tag=pve.spawn.house,limit=1,sort=random] at @s run summon skeleton ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],HandItems:[{id:"minecraft:bow"},{}],attributes:[{base:0.45d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}
execute if score zombie.type board matches 1 as @a[team=play.zombie,gamemode=adventure] as @e[tag=pve.spawn.house,limit=1,sort=random] at @s run summon skeleton ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],attributes:[{base:0.35d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}


## WARNING: Unsupport transformation
execute as @e[tag=pve.zombie] run data merge entity @s {PersistenceRequired:1b,ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],HandDropChances:[0.0f,0.0f]}

scoreboard players set zombie.state state 1

