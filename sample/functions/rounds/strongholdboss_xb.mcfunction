##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
# summon marker ~ ~ ~ {Tags:["pve","pve.spawn","pve.spawn.stongholdboss"]}
execute as @e[tag=pve.spawn.stongholdboss,limit=2,sort=random] at @s run summon vindicator ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",Attributes:[{Base:0.25d,Name:"generic.movement_speed"},{Base:3d,Name:"generic.attack_damage"},{Base:1d,Name:"generic.attack_speed"}],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",count:1,components:{"minecraft:unbreakable":{}}}],HandItems:[{id:"minecraft:iron_axe",count:1},{}]}
execute as @e[tag=pve.spawn.stongholdboss,limit=2,sort=random] at @s run summon vindicator ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",Attributes:[{Base:0.25d,Name:"generic.movement_speed"},{Base:3d,Name:"generic.attack_damage"},{Base:1d,Name:"generic.attack_speed"}],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",count:1,components:{"minecraft:unbreakable":{}}}],HandItems:[{id:"minecraft:iron_axe",count:1},{}]}
execute if score zombie.type board matches 2 as @e[tag=pve.spawn.stongholdboss,limit=1,sort=random] at @s run summon pillager ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",Attributes:[{Base:0.25d,Name:"generic.movement_speed"},{Base:3d,Name:"generic.attack_damage"},{Base:1d,Name:"generic.attack_speed"}],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",count:1,components:{"minecraft:unbreakable":{}}}],HandItems:[{id:"minecraft:crossbow",count:1},{}]}


execute as @e[tag=pve.zombie] run data merge entity @s {PersistenceRequired:1b,ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],HandDropChances:[0.0f,0.0f]}

scoreboard players set zombie.state state 1
scoreboard players set zombie.round board 26
