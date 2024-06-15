##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
##
# 544 -20 -128
#summon marker ~ ~ ~ {Tags:["pve","pve.spawn","pve.spawn.boss"]}

## WARNING: Unsupport transformation
execute as @e[tag=pve.zombie] run data merge entity @s {PersistenceRequired:1b,ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],HandDropChances:[0.0f,0.0f]}
execute if score zombie.type board matches 2 as @e[tag=pve.spawn.boss,limit=2,sort=random] at @s run summon vindicator ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],HandItems:[{id:"minecraft:iron_axe"},{}],attributes:[{base:0.35d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}
execute if score zombie.type board matches 1 as @e[tag=pve.spawn.boss,limit=1,sort=random] at @s run summon vindicator ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],HandItems:[{id:"minecraft:iron_axe"},{}],attributes:[{base:0.35d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}
execute if score zombie.type board matches 2 as @e[tag=pve.spawn.boss,limit=2,sort=random] at @s run summon witch ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],HandItems:[{id:"minecraft:iron_axe"},{}],attributes:[{base:0.35d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}
execute as @e[tag=pve.spawn.boss,limit=2,sort=random] at @s run summon witch ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],HandItems:[{id:"minecraft:iron_axe"},{}],attributes:[{base:0.35d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}
execute as @e[tag=pve.spawn.boss,limit=2,sort=random] at @s run summon pillager ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],HandItems:[{id:"minecraft:crossbow"},{}],attributes:[{base:0.35d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}
execute as @e[tag=pve.spawn.boss,limit=2,sort=random] at @s run summon zombie ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],HandItems:[{id:"minecraft:iron_sword"},{}],attributes:[{base:0.35d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}
execute as @e[tag=pve.spawn.boss,limit=2,sort=random] at @s run summon skeleton ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],HandItems:[{id:"minecraft:bow"},{}],attributes:[{base:0.35d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}
execute as @e[tag=pve.spawn.boss,limit=2,sort=random] at @s run summon wither_skeleton ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],HandItems:[{id:"minecraft:iron_sword"},{}],attributes:[{base:0.35d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}
execute as @e[tag=pve.spawn.boss,limit=2,sort=random] at @s run summon illusioner ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],HandItems:[{id:"minecraft:bow"},{}],attributes:[{base:0.35d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}
execute if score zombie.type board matches 2 as @e[tag=pve.spawn.boss,limit=2,sort=random] at @s run summon blaze ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",ArmorItems:[{},{},{},{id:"minecraft:leather_helmet"}],HandItems:[{id:"minecraft:bow"},{}],attributes:[{base:0.35d,id:"generic.movement_speed"},{base:3d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"}]}

scoreboard players set zombie.state state 1

