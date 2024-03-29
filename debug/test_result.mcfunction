# execute store result block 1 1 1 Items[0].tag.display.Name byte 1 if data entity @s {"Inventory":[{id:"minecraft:emerald",Count:1b,tag:{Enchantments:[{id:"minecraft:sharpness",lvl:1}]}}]}
## WARNING: The transformation may cause problem. You might need to modify it by yourself.
data modify block ~ ~ ~ Items[0].components."minecraft:enchantments".levels set from block ~ ~ ~ Items[1].components."minecraft:enchantments".levels
## Unsupport transformation
data merge block ~ ~ ~ {Items:[{tag:{display:{Name:'"1"'}}}]}

