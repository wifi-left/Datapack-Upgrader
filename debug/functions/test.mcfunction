##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
item replace entity @s container.10 with minecraft:white_banner[banner_patterns=[{color:"green",pattern:"minecraft:border"}],container=[],custom_name='{"text":"Convert Armor Stands to Markers","color":"green","bold":true}',lore=['{"text":"Range: 100 Blocks, excluding [no_marker]"}'],enchantments={levels:{}},custom_data={gui_item:1b}]

## WARNING: We found that you used 'Properties' tag for your player_head. We strongly recommand that you shouldn't use this tag! Due to a problem: https://bugs.mojang.com/browse/MC-268000
item replace entity @s container.26 with minecraft:player_head[custom_name='{"text":"Next Page (2)","color":"dark_red","bold":true}',lore=['{"text":"Click to change page!"}'],profile={id:[I;-720120218,160580295,-1700338408,-1472328904],properties:[{name:textures,value:"eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvMTliZjMyOTJlMTI2YTEwNWI1NGViYTcxM2FhMWIxNTJkNTQxYTFkODkzODgyOWM1NjM2NGQxNzhlZDIyYmYifX19"}]},custom_data={gui_item:1b}]

