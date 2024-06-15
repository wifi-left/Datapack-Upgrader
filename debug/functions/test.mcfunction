##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
##
summon minecraft:sheep ~ ~ ~ {Tags:["bw.tntsheep","bw.tntsheep.new"],CustomName:'["\\u00a7c\\u00a7lTNT SHEEP"]',CustomNameVisible:1b,Invulnerable:1b,Silent:1b,PersistenceRequired:1b,Sheared:false,DeathLootTable:"",Color:14b,attributes:[{base:1d,id:"generic.max_health"},{base:1d,id:"generic.knockback_resistance"},{base:0d,id:"generic.movement_speed"},{base:1d,id:"generic.follow_range"},{base:0d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"},{base:1d,id:"generic.armor"},{base:1d,id:"generic.armor_toughness"}],potion_contents:{custom_color:14b}}

##
summon minecraft:villager ~ ~ ~ {Invulnerable:1b,Health:100f,VillagerData:{profession:"minecraft:armorer",type:"minecraft:desert"},NoAI:1b,Tags:["pve.zombie"],attributes:[{base:100d,id:"generic.max_health"}]}
##
summon minecraft:zombie ~ ~ ~ {Invulnerable:1b,Health:100f,VillagerData:{profession:"minecraft:armorer",type:"minecraft:desert"},NoAI:1b,Tags:["pve.zombie"],attributes:[{base:100d,id:"generic.max_health"}]}
##
summon minecraft:zombie ~ ~ ~ {Health:100f,NoAI:1b,Tags:["pve.zombie"],attributes:[{base:100d,id:"generic.max_health"}]}
##
execute if score boat.type board matches 2 run summon minecraft:pig ~ ~ ~ {CustomNameVisible:1b,Invulnerable:1b,Silent:1b,PersistenceRequired:1b,Tags:["boat","boat.new"],DeathLootTable:"",Saddle:1b,Team:"boat",NoAI:1b,attributes:[{base:0.23d,id:"generic.movement_speed"}]}
execute if score boat.type board matches 3 run summon minecraft:strider ~ ~ ~ {CustomNameVisible:1b,Invulnerable:1b,Silent:1b,PersistenceRequired:1b,Tags:["boat","boat.new"],DeathLootTable:"",Saddle:1b,Team:"boat",NoAI:1b,attributes:[{base:0.22d,id:"generic.movement_speed"}]}
execute if score boat.type board matches 5 run summon minecraft:horse ~ ~ ~ {CustomNameVisible:1b,Invulnerable:1b,Silent:1b,PersistenceRequired:1b,Tags:["boat","boat.new"],DeathLootTable:"",Team:"boat",NoAI:1b,Tame:true,SaddleItem:{id:"minecraft:saddle",Count:1b},Temper:100,attributes:[{base:0.3d,id:"generic.movement_speed"},{base:0.6d,id:"horse.jump_strength"}]}
##
summon minecraft:zombie ~ ~1 ~ {CustomName:'["\\u00a7eBall"]',CustomNameVisible:1b,Silent:1b,PersistenceRequired:1b,Glowing:1b,Team:"golf",Tags:["golf.ball"],ArmorItems:[{id:"minecraft:leather_boots"},{id:"minecraft:leather_leggings"},{id:"minecraft:leather_chestplate"},{id:"minecraft:player_head"}],ArmorDropChances:[0f,0f,0f,0f],CanBreakDoors:false,DeathLootTable:"",IsBaby:false,attributes:[{base:10d,id:"generic.max_health"},{base:0d,id:"generic.knockback_resistance"},{base:0d,id:"generic.movement_speed"},{base:0d,id:"generic.follow_range"},{base:0d,id:"generic.attack_damage"},{base:0d,id:"generic.attack_speed"},{base:10d,id:"generic.armor"},{base:10d,id:"generic.armor_toughness"}]}
##
summon creeper ~ ~ ~ {DeathLootTable:"",Tags:["cmd.tnt.boom"],fuse:0,CustomName:'["\\u00a7c\\u00a7lTNT SHEEP"]',CustomNameVisible:1b,Invulnerable:1b,Silent:1b,PersistenceRequired:1b,ignited:true,ExplosionRadius:4b,attributes:[{base:1d,id:"generic.max_health"},{base:1d,id:"generic.knockback_resistance"},{base:0d,id:"generic.movement_speed"},{base:1d,id:"generic.follow_range"},{base:0d,id:"generic.attack_damage"},{base:1d,id:"generic.attack_speed"},{base:1d,id:"generic.armor"},{base:1d,id:"generic.armor_toughness"}]}
##
execute if score zombie.type board matches 1 as @e[tag=zombie.villager] at @s run summon villager ~ ~ ~ {Tags:["zombie.villagers"],NoAI:1b,PersistenceRequired:1b,Glowing:1b,VillagerData:{profession:"minecraft:none",type:"minecraft:snow"},Offers:{Recipes:[]},Rotation:[0.0f,0.0f],Health:20f,CustomNameVisible:1b,Team:"play.zombie",attributes:[{base:20d,id:"generic.max_health"}]}
##
summon minecraft:villager 630 10 -82 {CustomName:'["\\u00a74蜜斯莱哈雅 \\u00a7d[召唤师]"]',Invulnerable:1b,NoAI:1b,Silent:1b,PersistenceRequired:1b,VillagerData:{level:6,profession:"minecraft:librarian",type:"minecraft:desert"},Offers:{Recipes:[]},Tags:["pve.npc.pre","pve.zombie"],CustomNameVisible:1b,Health:100,attributes:[{base:100,id:"generic.max_health"}]}
##
summon minecraft:glow_squid 679 0 -83 {Tags:["pve.root","pve.zombie"],PersistenceRequired:1b,ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],HandDropChances:[0.0f,0.0f],CustomName:'"\\u00a7e兔子发疯罪魁祸首"',CustomNameVisible:1b,DeathLootTable:"minecraft:empty",active_effects:[{id:"glowing",duration:999999}],Health:30,attributes:[{base:1.0d,id:"generic.movement_speed"},{base:30d,id:"generic.max_health"}]}

