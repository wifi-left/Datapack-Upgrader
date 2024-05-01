##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
particle minecraft:dust{color:[0.059d, 0.973d, 0.439d],scale:1} ~ ~ ~ 0 0 0 1 1
give @s diamond[custom_name='"\\u00a7a1"'] 1
execute as @a[team=wait.jobpvp] at @s run kill @e[type=item,distance=0..6,nbt=!{Item:{components:{"minecraft:custom_data":{job_pvp:1}}}}]
scoreboard players reset @a[tag=!riding,scores={GCAR.long=-1..}] GCAR.long
## WARNING: The transformation may cause problem. You might need to modify it by yourself.
data modify entity @e[limit=1,type=item,tag=sur.loot.new] Item.components."minecraft:bundle_contents" set from entity @s Inventory

give @s diamond_block[can_place_on={predicates:[{blocks:["grass_block"]}],show_in_tooltip:false}]

particle minecraft:lava ~ ~ ~ 0 0 0 1 1
execute if data entity @s {data:{guntype:11}} run particle minecraft:campfire_signal_smoke ~ ~ ~ 0 0 0 1 1

