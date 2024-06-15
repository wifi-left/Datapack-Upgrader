##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
scoreboard players set zombie.round board 11

execute as @e[tag=pve.spawn.rabbit,limit=2,sort=random] at @s run summon rabbit ~ ~ ~ {Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",RabbitType:99,Attributes:[{Base:0.4d,Name:"generic.movement_speed"},{Base:5d,Name:"generic.attack_damage"},{Base:3d,Name:"generic.attack_speed"},{Base:3d,Name:"generic.max_health"}],ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",count:1,components:{"minecraft:unbreakable":{}}}],Health:3}
execute as @a[team=play.zombie,gamemode=adventure] as @e[tag=pve.spawn.rabbit,limit=1,sort=random] at @s run summon rabbit ~ ~ ~ {RabbitType:99,Tags:["pve.zombie"],DeathLootTable:"minecraft:empty",Attributes:[{Base:0.4d,Name:"generic.movement_speed"},{Base:5d,Name:"generic.attack_damage"},{Base:1d,Name:"generic.attack_speed"},{Base:3d,Name:"generic.max_health"}],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",count:1,components:{"minecraft:unbreakable":{}}}],Health:3}

execute as @e[tag=pve.zombie] run data merge entity @s {PersistenceRequired:1b,ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],HandDropChances:[0.0f,0.0f]}
scoreboard players set zombie.state state 1
