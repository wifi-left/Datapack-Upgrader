#> srn:handler/state/lobby/world_effects

## pipe of team side area
particle minecraft:splash -232 140 -13 0.625 0.75 0.625 0.025 8 force @a[tag=!srn.player.choose_elf,tag=!srn.player.choose_grinch]
particle minecraft:splash -232 140 13 0.625 0.75 0.625 0.025 8 force @a[tag=!srn.player.choose_elf,tag=!srn.player.choose_grinch]

particle minecraft:firework -232 140 -13 0.625 1.25 0.625 0.025 1 force @a[tag=!srn.player.choose_elf,tag=!srn.player.choose_grinch]
particle minecraft:firework -232 140 13 0.625 1.25 0.625 0.025 1 force @a[tag=!srn.player.choose_elf,tag=!srn.player.choose_grinch]

particle minecraft:cloud -232 140 -13 0.625 1.25 0.625 0.0125 1 force @a[tag=srn.player.choose_grinch]
particle minecraft:cloud -232 140 13 0.625 1.25 0.625 0.0125 1 force @a[tag=srn.player.choose_elf]



## credit area
execute if score #perio_3t srn.global matches 0 run particle end_rod -286 137 0 1.5 2.5 2.5 0.075 1 force



## centerpiece tree
particle minecraft:firefly -256 132 0 1.5 1.5 1.5 2 2 force