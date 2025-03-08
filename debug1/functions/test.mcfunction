##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
## WARNING: The transformation may cause problem. You might need to modify it by yourself.
data merge entity @e[type=item,limit=1] {Item:{components:{"minecraft:can_break":{predicates:[{blocks:"#minecraft:bedblocks"}],show_in_tooltip:false},"minecraft:can_place_on":{predicates:[{blocks:"#minecraft:bwplace"}],show_in_tooltip:false}}}}
