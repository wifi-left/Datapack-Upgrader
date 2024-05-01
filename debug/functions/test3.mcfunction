##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
tellraw @s ["\u00a7cSorry. 'English' translation didn't support anymore."]
execute if score bw.mode board matches 1 run function bedwars/resets/mogu
execute as @a[tag=undefined] at @s if score board board matches ..0 run function minecraft:bedwars/during/player/teleport

