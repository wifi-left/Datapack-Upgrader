scoreboard players operation #prev_lobby_proceedable srn.temp = #lobby_proceedable srn.global
scoreboard players set #lobby_proceedable srn.global 0




# if no one is choosing any role, don't proceed
execute unless score #lobby_player_choose_grinch srn.global matches 1.. run return -1
execute unless score #lobby_player_choose_elf srn.global matches 1.. run return -1




scoreboard players set #lobby_proceedable srn.global 1
execute unless score #lobby_proceedable srn.global = #prev_lobby_proceedable srn.temp run tellraw @a ""
execute unless score #lobby_proceedable srn.global = #prev_lobby_proceedable srn.temp run tellraw @a ["",{text:"🎁 Game:",color:"#6e97ff"}," ",{translate:"srn.lobby.announce.starting"}]
execute unless score #lobby_proceedable srn.global = #prev_lobby_proceedable srn.temp run tellraw @a ""




## check all player had choose sides
scoreboard players set #lobby_force_10_sec srn.global 0
scoreboard players operation #total_choose srn.temp = #lobby_player_choose_grinch srn.global
scoreboard players operation #total_choose srn.temp += #lobby_player_choose_elf srn.global
execute if score #total_choose srn.temp = #lobby_players srn.global run scoreboard players set #lobby_force_10_sec srn.global 1