##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
summon minecraft:sheep ~ ~ ~ {Tags:["bw.tntsheep","bw.tntsheep.new"],CustomName:'["\\u00a7c\\u00a7lTNT SHEEP"]',CustomNameVisible:1b,Invulnerable:1b,Silent:1b,PersistenceRequired:1b,Attributes:[{Base:1d,Name:"generic.max_health"},{Base:1d,Name:"generic.knockback_resistance"},{Base:0d,Name:"generic.movement_speed"},{Base:1d,Name:"generic.follow_range"},{Base:0d,Name:"generic.attack_damage"},{Base:1d,Name:"generic.attack_speed"},{Base:1d,Name:"generic.armor"},{Base:1d,Name:"generic.armor_toughness"}],Sheared:false,DeathLootTable:"",Color:14b}

##
summon minecraft:villager ~ ~ ~ {Invulnerable:1b,Health:100f,Attributes:[{Base:100d,Name:"generic.max_health"}],VillagerData:{profession:"minecraft:armorer",type:"minecraft:desert"},NoAI:1b,Tags:["pve.zombie"]}
##
summon minecraft:zombie ~ ~ ~ {Invulnerable:1b,Health:100f,Attributes:[{Base:100d,Name:"generic.max_health"}],VillagerData:{profession:"minecraft:armorer",type:"minecraft:desert"},NoAI:1b,Tags:["pve.zombie"]}
##
summon minecraft:zombie ~ ~ ~ {Health:100f,Attributes:[{Base:100d,Name:"generic.max_health"}],NoAI:1b,Tags:["pve.zombie"]}
##
execute if score boat.type board matches 2 run summon minecraft:pig ~ ~ ~ {CustomNameVisible:1b,Invulnerable:1b,Silent:1b,PersistenceRequired:1b,Tags:["boat","boat.new"],DeathLootTable:"",Saddle:1b,Team:"boat",Attributes:[{Base:0.23d,Name:"generic.movement_speed"}],NoAI:1b}
execute if score boat.type board matches 3 run summon minecraft:strider ~ ~ ~ {CustomNameVisible:1b,Invulnerable:1b,Silent:1b,PersistenceRequired:1b,Tags:["boat","boat.new"],DeathLootTable:"",Saddle:1b,Team:"boat",Attributes:[{Base:0.22d,Name:"generic.movement_speed"}],NoAI:1b}
execute if score boat.type board matches 5 run summon minecraft:horse ~ ~ ~ {CustomNameVisible:1b,Invulnerable:1b,Silent:1b,PersistenceRequired:1b,Tags:["boat","boat.new"],DeathLootTable:"",Team:"boat",Attributes:[{Base:0.3d,Name:"generic.movement_speed"},{Name:"horse.jump_strength",Base:0.6d}],NoAI:1b,Tame:true,SaddleItem:{id:"minecraft:saddle",Count:1b},Temper:100}
##
summon minecraft:zombie ~ ~1 ~ {CustomName:'["\\u00a7eBall"]',CustomNameVisible:1b,Silent:1b,PersistenceRequired:1b,Glowing:1b,Team:"golf",Tags:["golf.ball"],Attributes:[{Base:10d,Name:"generic.max_health"},{Base:0d,Name:"generic.knockback_resistance"},{Base:0d,Name:"generic.movement_speed"},{Base:0d,Name:"generic.follow_range"},{Base:0d,Name:"generic.attack_damage"},{Base:0d,Name:"generic.attack_speed"},{Base:10d,Name:"generic.armor"},{Base:10d,Name:"generic.armor_toughness"}],ArmorItems:[{id:"minecraft:leather_boots",count:1,components:{"minecraft:unbreakable":{},"minecraft:dyed_color":{rgb:1241313}}},{id:"minecraft:leather_leggings",count:1,components:{"minecraft:unbreakable":{},"minecraft:dyed_color":{rgb:1241313}}},{id:"minecraft:leather_chestplate",count:1,components:{"minecraft:unbreakable":{},"minecraft:dyed_color":{rgb:1241313}}},{id:"minecraft:player_head",count:1,components:{"minecraft:profile":"MHF_OakLog"}}],ArmorDropChances:[0f,0f,0f,0f],CanBreakDoors:false,DeathLootTable:"",IsBaby:false}
##
summon creeper ~ ~ ~ {DeathLootTable:"",Tags:["cmd.tnt.boom"],fuse:0,CustomName:'["\\u00a7c\\u00a7lTNT SHEEP"]',CustomNameVisible:1b,Invulnerable:1b,Silent:1b,PersistenceRequired:1b,Attributes:[{Base:1d,Name:"generic.max_health"},{Base:1d,Name:"generic.knockback_resistance"},{Base:0d,Name:"generic.movement_speed"},{Base:1d,Name:"generic.follow_range"},{Base:0d,Name:"generic.attack_damage"},{Base:1d,Name:"generic.attack_speed"},{Base:1d,Name:"generic.armor"},{Base:1d,Name:"generic.armor_toughness"}],ignited:true,ExplosionRadius:4b}
##
execute if score zombie.type board matches 1 as @e[tag=zombie.villager] at @s run summon villager ~ ~ ~ {Tags:["zombie.villagers"],NoAI:1b,PersistenceRequired:1b,Glowing:1b,VillagerData:{profession:"minecraft:none",type:"minecraft:snow"},Offers:{Recipes:[]},Rotation:[0.0f,0.0f],Health:20f,Attributes:[{Base:20d,Name:"generic.max_health"}],CustomNameVisible:1b,Team:"play.zombie"}
##
summon minecraft:villager 630 10 -82 {CustomName:'["\\u00a74蜜斯莱哈雅 \\u00a7d[召唤师]"]',Invulnerable:1b,NoAI:1b,Silent:1b,PersistenceRequired:1b,VillagerData:{level:6,profession:"minecraft:librarian",type:"minecraft:desert"},Offers:{Recipes:[]},Tags:["pve.npc.pre","pve.zombie"],CustomNameVisible:1b,Attributes:[{Name:"generic.max_health",Base:100}],Health:100}
##
summon minecraft:glow_squid 679 0 -83 {Tags:["pve.root","pve.zombie"],PersistenceRequired:1b,ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],HandDropChances:[0.0f,0.0f],CustomName:'"\\u00a7e兔子发疯罪魁祸首"',CustomNameVisible:1b,DeathLootTable:"minecraft:empty",active_effects:[{id:"glowing",duration:999999}],Attributes:[{Base:1.0d,Name:"generic.movement_speed"},{Base:30d,Name:"generic.max_health"}],Health:30}
