particle minecraft:dust 0.059 0.973 0.439 1 ~ ~ ~ 0 0 0 1 1
give @s diamond{display:{Name:'"\\u00a7a1"'}} 1
execute as @a[team=wait.jobpvp] at @s run kill @e[type=item,distance=0..6,nbt=!{Item:{tag:{job_pvp:1}}}]
scoreboard players reset @a[tag=!riding,scores={GCAR.long=-1..}] GCAR.long
data modify entity @e[limit=1,type=item,tag=sur.loot.new] Item.tag.Items set from entity @s Inventory

give @s diamond_block{CanPlaceOn:["grass_block"],HideFlags:127b}

particle minecraft:lava ~ ~ ~ 0 0 0 1 1
execute if data entity @s {data:{guntype:11}} run particle minecraft:campfire_signal_smoke ~ ~ ~ 0 0 0 1 1
