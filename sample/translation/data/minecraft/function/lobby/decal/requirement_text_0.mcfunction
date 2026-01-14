#> srn:handler/state/lobby/decal/requirement_text_0
# devnote: ran using "execute summon text_display"

execute if score #is_shadow srn.global matches 0 run data merge entity @s {Tags:["srn.entity.world_disposable","srn.entity.type.requirement_text_0"],background:0,default_background:0b,view_range:16,text_opacity:255,transformation:{translation:[0.0f,0.0f,0.075f],scale:[1.1875f,1.1875f,1.1875f]},see_through:false,brightness:{sky:15,block:15},alignment:"center",\
    text: [ "", \
        {text:"👤 Player requirements 👤\n"}, \
        {text:"Minimum 2 \nRecommended 4 \n"}, \
        {text:"❗ The game is meant to be played with more ",color:gold},{text:"a",font:"holiday25:player_tags",shadow_color:0},{text:" than ",color:gold},{text:"b",font:"holiday25:player_tags",shadow_color:0},{text:" ❗ \n\n",color:gold}, \
        {text:"🔊 Adjust your audio settings for best experience\n"}, \
        {text:"🔊 Enable Sound Closed Captions / Subtitles if necessary", color:"gray"}, \
    ] \
}


execute if score #is_shadow srn.global matches 1 run data merge entity @s {Tags:["srn.entity.world_disposable","srn.entity.type.requirement_text_0"],background:0,default_background:0b,view_range:16,text_opacity:255,transformation:{translation:[0.0f,0.0f,0.0f],scale:[1.1875f,1.1875f,1.1875f]},see_through:false,brightness:{sky:15,block:15},alignment:"center",\
    text: [ {text:"👤 Player requirements 👤\n",color:"black"}, \
        {text:"Minimum 2 \nRecommended 4 \n"}, \
        {text:"❗ The game is meant to be played with more "},{text:"a",font:"holiday25:player_tags",shadow_color:0},{text:" than "},{text:"b",font:"holiday25:player_tags",shadow_color:0},{text:" ❗ \n\n"}, \
        {text:"🔊 Adjust your audio settings for best experience\n"}, \
        {text:"🔊 Enable Sound Closed Captions / Subtitles if necessary"}, \
    ] \
}



scoreboard players operation @s srn.world.id = #LOBBY_WORLD_TEMPLATE_ID srn.global
rotate @s ~ ~