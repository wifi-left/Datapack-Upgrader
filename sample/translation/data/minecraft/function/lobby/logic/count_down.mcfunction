scoreboard players remove #lobby_preparation_countdown srn.global 1



# Per Second Event (different sound if below 10 seconds or not)
scoreboard players operation #math srn.temp = #lobby_preparation_countdown srn.global
scoreboard players operation #math srn.temp %= #20 srn.global
execute if score #math srn.temp matches 19 if score #lobby_preparation_countdown srn.global matches 200.. as @a positioned as @s run playsound holiday25:srn.generic.countdown master @s ~ ~ ~ 0.325 1 0.325
execute if score #math srn.temp matches 19 if score #lobby_preparation_countdown srn.global matches ..199 as @a positioned as @s run playsound holiday25:srn.generic.countdown master @s ~ ~ ~ 0.325 1.25 0.325




## when 10 seconds left
execute if score #lobby_preparation_countdown srn.global matches 200 run tellraw @a ""
execute if score #lobby_preparation_countdown srn.global matches 200 run tellraw @a ["",{text:"🎁 Game:",color:"#6e97ff"}," ",{translate:"srn.lobby.announce.starting_10"}]
execute if score #lobby_preparation_countdown srn.global matches 200 run tellraw @a ""



## when all players had choose side
execute if score #lobby_force_10_sec srn.global matches 1 if score #lobby_preparation_countdown srn.global matches 221.. run scoreboard players set #lobby_preparation_countdown srn.global 220



## transition
scoreboard players set #duration srn.global 50

execute if score #lobby_preparation_countdown srn.global matches 14 as @a run title @s times 15 5 10
execute if score #lobby_preparation_countdown srn.global matches 14 as @a run function srn:player/title_state/elf/fade/start_foreign

execute if score #lobby_preparation_countdown srn.global matches 2 run effect give @a minecraft:blindness 1 0 true

execute if score #lobby_preparation_countdown srn.global matches ..0 run function srn:handler/state/play/start