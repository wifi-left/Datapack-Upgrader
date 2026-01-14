#> srn:handler/state/lobby/state

## ORIGIN: -256 128 0


# lobby tips
scoreboard players add #tip_announce srn.temp 1
execute if score #tip_announce srn.temp matches 1200.. if score #global_game_setting_show_tips srn.global matches 1 run function srn:generic/tip/roll_lobby_elf
execute if score #tip_announce srn.temp matches 1200.. run scoreboard players set #tip_announce srn.temp 0




# grinch & elf area detection
scoreboard players set #lobby_player_choose_elf srn.global 0
scoreboard players set #lobby_player_choose_grinch srn.global 0
scoreboard players set #lobby_players srn.global 0

execute as @a positioned as @s run function srn:handler/state/lobby/logic/as_player



# checking proceedability before advancing to play gamestate
function srn:handler/state/lobby/logic/check_proceedable
execute if score #lobby_proceedable srn.global matches 1 run function srn:handler/state/lobby/logic/count_down
execute if score #lobby_proceedable srn.global matches 0 run scoreboard players set #lobby_preparation_countdown srn.global 600




## world effects
function srn:handler/state/lobby/world_effects



## force rain
execute if score #perio_1s srn.global matches 0 run weather rain 99999999999999999999999999999999999999d