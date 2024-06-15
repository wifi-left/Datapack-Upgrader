##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
# summon marker ~ ~ ~ {Tags:["pve","pve.spawn","pve.spawn.house"]}
execute if score zombie.type board matches 2 as @e[tag=pve.spawn.house,sort=random,limit=10] at @s run summon zombie ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",Attributes:[{Base:0.4d,Name:"generic.movement_speed"},{Base:5d,Name:"generic.attack_damage"},{Base:1.4d,Name:"generic.attack_speed"}],ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",count:1,components:{"minecraft:unbreakable":{}}}]}
execute if score zombie.type board matches 1 as @e[tag=pve.spawn.house,sort=random,limit=10] at @s run summon zombie_villager ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",Attributes:[{Base:0.3d,Name:"generic.movement_speed"},{Base:3d,Name:"generic.attack_damage"},{Base:1d,Name:"generic.attack_speed"}],ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",count:1,components:{"minecraft:unbreakable":{}}}]}
execute as @a[team=play.zombie,gamemode=adventure] as @e[tag=pve.spawn.house,limit=2,sort=random] at @s run summon zombie ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",Attributes:[{Base:0.3d,Name:"generic.movement_speed"},{Base:3d,Name:"generic.attack_damage"},{Base:1d,Name:"generic.attack_speed"}],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",count:1,components:{"minecraft:unbreakable":{}}}]}

execute if score zombie.type board matches 2 as @a[team=play.zombie,gamemode=adventure] as @e[tag=pve.spawn.house,limit=1,sort=random] at @s run summon skeleton ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",Attributes:[{Base:0.45d,Name:"generic.movement_speed"},{Base:3d,Name:"generic.attack_damage"},{Base:1d,Name:"generic.attack_speed"}],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",count:1,components:{"minecraft:unbreakable":{}}}],HandItems:[{id:"minecraft:bow"},{}]}
execute if score zombie.type board matches 1 as @a[team=play.zombie,gamemode=adventure] as @e[tag=pve.spawn.house,limit=1,sort=random] at @s run summon skeleton ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",Attributes:[{Base:0.35d,Name:"generic.movement_speed"},{Base:3d,Name:"generic.attack_damage"},{Base:1d,Name:"generic.attack_speed"}],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",count:1,components:{"minecraft:unbreakable":{}}}]}


execute as @e[tag=pve.zombie] run data merge entity @s {PersistenceRequired:1b,ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],HandDropChances:[0.0f,0.0f]}

scoreboard players set zombie.state state 1
