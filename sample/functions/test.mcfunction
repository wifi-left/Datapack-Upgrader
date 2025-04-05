summon minecraft:glow_squid 679 0 -83 {Tags:["pve.root","pve.zombie"],PersistenceRequired:1b,ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],HandDropChances:[0.0f,0.0f],CustomName:"\u00a7e兔子发疯罪魁祸首",CustomNameVisible:1b,DeathLootTable:"minecraft:empty",active_effects:[{id:"glowing",duration:999999}],Health:30,attributes:[{base:1.0d,id:"movement_speed"},{base:30d,id:"max_health"}]}

execute as @e[tag=pve.zombie] run data merge entity @s {PersistenceRequired:1b,ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],HandDropChances:[0.0f,0.0f]}
