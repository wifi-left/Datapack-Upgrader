#> srn:handler/state/lobby/logic/as_player


# count
scoreboard players add #lobby_players srn.global 1


## check if in choosing area
# devnote: hardcoded locations

scoreboard players set #in_choose_area srn.temp 0

execute positioned -235.0 131.0 -16.0 if entity @s[dx=6,dy=6,dz=6] positioned as @s run function srn:handler/state/lobby/logic/as_player_choose_grinch
execute positioned -235.0 131.0 10.0 if entity @s[dx=6,dy=6,dz=6] positioned as @s run function srn:handler/state/lobby/logic/as_player_choose_elf

execute if score #in_choose_area srn.temp matches 0 run tag @s remove srn.player.choose_elf
execute if score #in_choose_area srn.temp matches 0 run tag @s remove srn.player.choose_grinch

execute if score #in_choose_area srn.temp matches 1 if score #perio_3t srn.global matches 0 run particle minecraft:soul_fire_flame ~ ~.25 ~ 0.25 0.125 0.25 0.0125 1 normal




## check if outside the lobby bounds & ignore for debug
# devnote: hardcoded locations
execute positioned -294.0 124 -27.0 if entity @s[dx=74,dy=49,dz=74] run return 1
execute if entity @s[tag=srn.debug] run return 1
tp @s -276 135 0 -90 -25

gamemode adventure @s[tag=!srn.debug]