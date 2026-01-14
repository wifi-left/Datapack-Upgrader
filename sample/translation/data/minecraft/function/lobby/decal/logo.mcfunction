#> srn:handler/state/lobby/decal/logo
# devnote: ran using "execute summon item_display"

data merge entity @s {Tags:["srn.entity.world_disposable","srn.entity.type.logo"],view_range:32,transformation:{scale:[9.187501f, 9.187501f, 9.187501f]},see_through:false,brightness:{sky:15,block:15},item:{id:"minecraft:diamond",count:1,components:{"minecraft:item_model":"holiday25:technical/extended_logo"}}}
scoreboard players operation @s srn.world.id = #LOBBY_WORLD_TEMPLATE_ID srn.global
rotate @s ~ ~