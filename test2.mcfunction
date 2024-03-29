# execute store result block 1 1 1 Items[0].tag.display.Name byte 1 if data entity @s {"Inventory":[{id:"minecraft:emerald",Count:1b,tag:{Enchantments:[{id:"minecraft:sharpness",lvl:1}]}}]}
data modify block ~ ~ ~ Items[0].tag.Enchantments set from block ~ ~ ~ Items[1].tag.Enchantments
data merge block ~ ~ ~ {Items:[{tag:{display:{Name:'"1"'}}}]}
