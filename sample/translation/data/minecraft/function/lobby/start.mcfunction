#> srn:handler/state/lobby/start

# devnote: hardcoded locations

## setup
scoreboard players set #game_state srn.global 0
function srn:handler/bossbar/wait/start

scoreboard players set #global_elf_gift_exchanged srn.global 0
scoreboard players set #global_elf_gift_total srn.global 0


## denullify settings
execute unless score #global_game_setting_game_duration srn.global = #global_game_setting_game_duration srn.global run scoreboard players set #global_game_setting_game_duration srn.global 6000
execute unless score #global_game_setting_friendly_nametag srn.global = #global_game_setting_friendly_nametag srn.global run scoreboard players set #global_game_setting_friendly_nametag srn.global 0
execute unless score #global_game_setting_show_tips srn.global = #global_game_setting_show_tips srn.global run scoreboard players set #global_game_setting_show_tips srn.global 1



## reset time
function srn:generic/daytime/reset



## clear chat (borrowing logic function)
tellraw @a ["\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n","\n",]
function srn:handler/state/conclusion/logic/announce_winner



## players (devnote: hardcoded location)
team modify ELF nametagVisibility always
execute as @a positioned -276 134 0 run function srn:handler/state/lobby/start_as_players



## clear & generate lobby
function srn:handler/worlds/destroy/all
scoreboard players set #world_template_generate_id srn.global 0
function srn:handler/worlds/gen/process/start