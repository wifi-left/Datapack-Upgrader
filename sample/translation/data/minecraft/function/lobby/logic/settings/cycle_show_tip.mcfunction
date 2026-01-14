#> srn:handler/state/lobby/logic/settings/cycle_show_tip

# cycle between
# no (0) & ya (1)

scoreboard players add #global_game_setting_show_tips srn.global 1
scoreboard players operation #global_game_setting_show_tips srn.global %= #2 srn.global


# announce
tellraw @a ""

execute if score #global_game_setting_show_tips srn.global matches 0 run tellraw @a ["",{text:"🔧 Settings:",color:"#6e97ff"}," ",{translate:"srn.settings_set.1_false"}]
execute if score #global_game_setting_show_tips srn.global matches 1 run tellraw @a ["",{text:"🔧 Settings:",color:"#6e97ff"}," ",{translate:"srn.settings_set.1_true"}]

tellraw @a ""