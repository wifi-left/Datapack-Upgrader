tellraw @s ["\u00a7cSorry. 'English' translation didn't support anymore."]
execute if score bw.mode board matches 1 run function bedwars/resets/mogu
execute as @a[tag=bw.fhing] at @s if score board board matches ..0 run function minecraft:bedwars/during/player/teleport
