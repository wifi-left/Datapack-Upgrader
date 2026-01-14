#> srn:handler/state/lobby/logic/settings/cycle_game_duration

# cycle between
# 5 mins, 10 mins, 15 mins, 20 mins, 25 mins, and 30 mins

scoreboard players operation #global_game_setting_game_duration srn.global /= #60 srn.global
scoreboard players operation #global_game_setting_game_duration srn.global /= #20 srn.global
scoreboard players add #global_game_setting_game_duration srn.global 5
scoreboard players operation #announce srn.temp = #global_game_setting_game_duration srn.global
scoreboard players operation #global_game_setting_game_duration srn.global *= #60 srn.global
scoreboard players operation #global_game_setting_game_duration srn.global *= #20 srn.global


scoreboard players operation #global_game_setting_game_duration srn.global %= #GLOBAL_GAME_DURATION_LIMIT srn.global
execute if score #global_game_setting_game_duration srn.global matches 0 run scoreboard players set #global_game_setting_game_duration srn.global 36000



# announce
tellraw @a ""

scoreboard players operation #announce srn.temp = #global_game_setting_game_duration srn.global
scoreboard players operation #announce srn.temp /= #60 srn.global
scoreboard players operation #announce srn.temp /= #20 srn.global
tellraw @a ["",{text:"🔧 Settings:",color:"#6e97ff"}," ",{translate:"srn.settings_set.0",with:[{score:{objective:"srn.temp",name:"#announce"}}]}]


scoreboard players operation #timeout_duration srn.temp = #global_game_setting_game_duration srn.global
function srn:handler/state/play/get_gift_requirement
tellraw @a ["",{text:"🔧 Settings:",color:"#6e97ff"}," ",{translate:"srn.settings_set.0_gift_count",with:[{score:{objective:"srn.temp",name:"#gift_total"}}]}]

tellraw @a ""