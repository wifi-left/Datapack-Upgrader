#> srn:handler/state/lobby/decal/settings_indic
# devnote: ran using "execute summon text_display" and type if of 0-3



execute if score #type srn.global matches 0 run data merge entity @s {Tags:["srn.entity.world_disposable","srn.entity.type.settings_indic"],view_range:0.5,brightness:{sky:15,block:15},alignment:"center",background:0,billboard:"fixed",default_background:0b,line_width:200,see_through:0b,shadow:0b,text:"Game Settings",transformation:{left_rotation:[-0.18301265f,0.6830127f,-0.18301265f,-0.6830127f],right_rotation:[0.0f,0.0f,0.0f,1.0f],scale:[3.9999998f,4.0000005f,4.0f],translation:[0.0f,0.0f,0.0f]},width:0.0f}
execute if score #type srn.global matches 1 run data merge entity @s {Tags:["srn.entity.world_disposable","srn.entity.type.settings_indic"],view_range:0.5,brightness:{sky:15,block:15},alignment:"center",background:0,billboard:"fixed",default_background:0b,line_width:200,see_through:0b,shadow:0b,text:"Show helpful\nin game tips?",transformation:{left_rotation:[0.0f,-0.7071068f,0.0f,0.7071068f],right_rotation:[0.0f,0.0f,0.0f,1.0f],scale:[0.9999998f,1.0f,0.9999998f],translation:[0.0f,0.0f,0.0f]},width:0.0f}
execute if score #type srn.global matches 2 run data merge entity @s {Tags:["srn.entity.world_disposable","srn.entity.type.settings_indic"],view_range:0.5,brightness:{sky:15,block:15},alignment:"center",background:0,billboard:"fixed",default_background:0b,line_width:200,see_through:0b,shadow:0b,text:"Game duration in minutes",transformation:{left_rotation:[0.0f,-0.7071068f,0.0f,0.7071068f],right_rotation:[0.0f,0.0f,0.0f,1.0f],scale:[1.5000002f,1.5000004f,1.5000002f],translation:[0.0f,0.0f,0.0f]},width:0.0f}
execute if score #type srn.global matches 3 run data merge entity @s {Tags:["srn.entity.world_disposable","srn.entity.type.settings_indic"],view_range:0.5,brightness:{sky:15,block:15},alignment:"center",background:0,billboard:"fixed",default_background:0b,line_width:200,see_through:0b,shadow:0b,text:"Show friendly\nnametag in game?",transformation:{left_rotation:[0.0f,-0.7071068f,0.0f,0.7071068f],right_rotation:[0.0f,0.0f,0.0f,1.0f],scale:[0.8500003f,0.85000026f,0.8500003f],translation:[0.0f,0.0f,0.0f]},width:0.0f}


scoreboard players operation @s srn.world.id = #LOBBY_WORLD_TEMPLATE_ID srn.global

