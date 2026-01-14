#> srn:handler/state/lobby/decal/team_sides
# devnote: ran using "execute summon text_display" and type if of 0-3


execute if score #type srn.global matches 0 run data merge entity @s {Tags:["srn.entity.world_disposable","srn.entity.type.team_sides"],view_range:16,brightness:{sky:15,block:15},alignment:"center",background:0,billboard:"fixed",default_background:0b,line_width:200,see_through:0b,shadow:0b,text:[{text:"Kid",color:"green"}],transformation:{left_rotation:[0.0f,-0.7071068f,0.0f,0.7071068f],right_rotation:[0.0f,0.0f,0.0f,1.0f],scale:[6.0000005f,6.000002f,6.0000005f],translation:[0.0f,0.0f,0.0f]},width:0.0f}

execute if score #type srn.global matches 1 run data merge entity @s {Tags:["srn.entity.world_disposable","srn.entity.type.team_sides"],view_range:16,brightness:{sky:15,block:15},alignment:"center",background:0,billboard:"fixed",default_background:0b,line_width:200,see_through:0b,shadow:0b,text:[{text:"N",color:"green"},{text:"a",color:"white"},{text:"u",color:"green"},{text:"g",color:"white"},{text:"h",color:"green"},{text:"t",color:"white"},{ text: "y", color: "green" }],transformation:{left_rotation:[0.0f,-0.7071068f,0.0f,0.7071068f],right_rotation:[0.0f,0.0f,0.0f,1.0f],scale:[2.9995465f,2.9995468f,2.9995465f],translation:[0.0f,0.0f,0.0f]},width:0.0f}

execute if score #type srn.global matches 2 run data merge entity @s {Tags:["srn.entity.world_disposable","srn.entity.type.team_sides"],view_range:16,brightness:{sky:15,block:15},alignment:"center",background:0,billboard:"fixed",default_background:0b,line_width:200,see_through:0b,shadow:0b,text:[{text:"Elf",color:"red"}],transformation:{left_rotation:[0.0f,-0.7071068f,0.0f,0.7071068f],right_rotation:[0.0f,0.0f,0.0f,1.0f],scale:[6.0000005f,6.000002f,5.9999995f],translation:[0.0f,0.0f,0.0f]},width:0.0f}

execute if score #type srn.global matches 3 run data merge entity @s {Tags:["srn.entity.world_disposable","srn.entity.type.team_sides"],view_range:16,brightness:{sky:15,block:15},alignment:"center",background:0,billboard:"fixed",default_background:0b,line_width:200,see_through:0b,shadow:0b,text:[{text:"F",color:"red"},{text:"e",color:"white"},{text:"l",color:"red"},{text:"l",color:"white"},{text:"o",color:"red"},{text:"w",color:"white"}],transformation:{left_rotation:[0.0f,-0.7071068f,0.0f,0.7071068f],right_rotation:[0.0f,0.0f,0.0f,1.0f],scale:[2.9995465f,2.9995468f,2.9995465f],translation:[0.0f,0.0f,0.0f]},width:0.0f}




scoreboard players operation @s srn.world.id = #LOBBY_WORLD_TEMPLATE_ID srn.global