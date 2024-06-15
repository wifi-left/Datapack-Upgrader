##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
# summon marker ~ ~ ~ {Tags:["pve","pve.spawn","pve.spawn.lava"]}
execute if score zombie.round board matches 23..24 as @e[tag=pve.spawn.lava,limit=5,sort=random] at @s run summon blaze ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",Attributes:[{Base:0.3d,Name:"generic.movement_speed"},{Base:3d,Name:"generic.attack_damage"},{Base:1d,Name:"generic.attack_speed"}],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",count:1,components:{"minecraft:unbreakable":{}}}],HandItems:[{id:"minecraft:iron_axe",count:1},{}]}
execute if score zombie.round board matches 23 as @a[team=play.zombie,gamemode=adventure] as @e[tag=pve.spawn.lava,limit=2,sort=random] at @s run summon blaze ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",Attributes:[{Base:0.3d,Name:"generic.movement_speed"},{Base:3d,Name:"generic.attack_damage"},{Base:1d,Name:"generic.attack_speed"}],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",count:1,components:{"minecraft:unbreakable":{}}}],HandItems:[{id:"minecraft:iron_axe",count:1},{}]}
execute if score zombie.round board matches 24 as @a[team=play.zombie,gamemode=adventure] as @e[tag=pve.spawn.lava,limit=3,sort=random] at @s run summon blaze ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",Attributes:[{Base:0.4d,Name:"generic.movement_speed"},{Base:3d,Name:"generic.attack_damage"},{Base:1d,Name:"generic.attack_speed"}],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",count:1,components:{"minecraft:unbreakable":{}}}],HandItems:[{id:"minecraft:iron_axe",count:1},{}]}
# execute if score zombie.round board matches 18..22 as @a[team=play.zombie,gamemode=adventure] as @e[tag=pve.spawn.stronghold,limit=2,sort=random] at @s run summon pillager ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",Attributes:[{Base:0.3d,Name:"generic.movement_speed"},{Base:3d,Name:"generic.attack_damage"},{Base:1d,Name:"generic.attack_speed"}],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",Count:1b,tag:{Unbreakable:1b}}],HandItems:[{id:"minecraft:crossbow",Count:1b},{}]}
# execute if score zombie.round board matches 18..22 as @a[team=play.zombie,gamemode=adventure] as @e[tag=pve.spawn.stronghold,limit=2,sort=random] at @s run summon witch ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",Attributes:[{Base:0.3d,Name:"generic.movement_speed"},{Base:3d,Name:"generic.attack_damage"},{Base:1d,Name:"generic.attack_speed"}],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",Count:1b,tag:{Unbreakable:1b}}]}



execute as @e[tag=pve.zombie] run data merge entity @s {PersistenceRequired:1b,ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],HandDropChances:[0.0f,0.0f]}

scoreboard players set zombie.state state 1
