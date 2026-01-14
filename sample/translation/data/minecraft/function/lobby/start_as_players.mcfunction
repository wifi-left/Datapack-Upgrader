#> srn:handler/state/lobby/start_as_players

scoreboard players set @s srn.player.room.id -1
scoreboard players set @s srn.player.elf.gift_exchanged 0

function srn:player/powerup/reset
function srn:player/type/reset
function srn:player/type/elf/transform



ride @s dismount
execute as @n[type=minecraft:minecart,tag=srn.entity.type.jar,distance=..4] positioned as @s run function srn:entity/terminate



tp @s ~ ~ ~ -90 -25
tp @s ~ ~ ~ -90 -25



## clear dialogs
execute if entity @s[team=ELF] run function srn:player/dialog/elf/clear_all_queues
execute if entity @s[team=JARRED] run function srn:player/dialog/elf/clear_all_queues
execute if entity @s[team=GRINCH] run function srn:player/dialog/grinch/clear_all_queues



gamemode adventure @s[tag=!srn.debug]


## not playing
tag @s remove srn.player.is_playing_ingame