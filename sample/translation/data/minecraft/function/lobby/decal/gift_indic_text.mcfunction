#> srn:handler/state/lobby/decal/gift_indic_text
# devnote: ran using "execute summon text_display"

execute if score #var srn.temp matches 0 run data merge entity @s {Tags:["srn.entity.world_disposable","srn.entity.type.gift_indic_text"],default_background:false,background:0,view_range:16,billboard:"vertical",transformation:{scale:[1.5f,1.5f,1.5f]},see_through:false,brightness:{sky:15,block:15},alignment:"center", \
    text: [ "", \
        {text:"⬇ Pick 🎁 up ⬇", color:"white", bold:true}, \
    ] \
}


execute if score #var srn.temp matches 1 run data merge entity @s {Tags:["srn.entity.world_disposable","srn.entity.type.gift_indic_text"],default_background:false,background:0,view_range:16,transformation:{scale:[2f,2f,2f]},see_through:false,brightness:{sky:15,block:15},alignment:"center", \
    text: [ "", \
        {text:"⬇ Put 🎁 here ⬇", color:"white", bold:true}, \
    ] \
}

execute if score #var srn.temp matches 2 run data merge entity @s {Tags:["srn.entity.world_disposable","srn.entity.type.gift_indic_text"],Rotation:[180f,0f],default_background:false,background:0,view_range:16,transformation:{scale:[2f,2f,2f]},see_through:false,brightness:{sky:15,block:15},alignment:"center", \
    text: [ "", \
        {text:"⬇ Put 🎁 here ⬇", color:"white", bold:true}, \
    ] \
}


scoreboard players operation @s srn.world.id = #LOBBY_WORLD_TEMPLATE_ID srn.global