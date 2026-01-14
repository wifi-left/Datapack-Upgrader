execute if entity @s[tag=!srn.player.choose_grinch] run playsound holiday25:srn.generic.choose_side master @s ~ ~ ~ 0.5 1 0


tag @s add srn.player.choose_grinch
tag @s remove srn.player.choose_elf


scoreboard players add #lobby_player_choose_grinch srn.global 1
scoreboard players set #in_choose_area srn.temp 1