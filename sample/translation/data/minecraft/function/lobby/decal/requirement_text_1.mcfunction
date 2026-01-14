#> srn:handler/state/lobby/decal/requirement_text_1
# devnote: ran using "execute summon text_display"

execute if score #is_shadow srn.global matches 0 run data merge entity @s {Tags:["srn.entity.world_disposable","srn.entity.type.requirement_text_1"],view_range:16,background:0,default_background:0b,text_opacity:255,transformation:{translation:[0.0f,0.0f,0.075f],scale:[1.1875f,1.1875002f,1.1875002f]},see_through:false,brightness:{sky:15,block:15},alignment:"center",\
    text: [ "", \
        {text:"📽 Video Settings 📽\n"}, \
        {text:"• Graphics ➡ Fabulous! recommended, Fancy required\n", color:"gray"}, \
        {text:"• Leaves ➡ Fancy\n", color:"gray"}, \
        {text:"• Weather ➡ Fancy\n\n", color:"gray"}, \
        {text:"💡 Disable any brightness modification for best experience\n"}, \
        {text:"💡 Adjust the brightness setting as needed\n\n", color:"gray"}, \
        {text:"✨ Disable shader (Optifine/Iris)"}, \
    ] \
}


execute if score #is_shadow srn.global matches 1 run data merge entity @s {Tags:["srn.entity.world_disposable","srn.entity.type.requirement_text_1"],view_range:16,background:0,default_background:0b,text_opacity:255,transformation:{translation:[0.0f,0.0f,0.0f],scale:[1.1875f,1.1875002f,1.1875002f]},see_through:false,brightness:{sky:15,block:15},alignment:"center",\
    text: [ {text:"📽 Video Settings 📽\n", color:"black"}, \
        {text:"• Graphics ➡ Fabulous! recommended, Fancy required\n"}, \
        {text:"• Leaves ➡ Fancy\n"}, \
        {text:"• Weather ➡ Fancy\n\n"}, \
        {text:"💡 Disable any brightness modification for best experience\n"}, \
        {text:"💡 Adjust the brightness setting as needed\n\n"}, \
        {text:"✨ Disable shader (Optifine/Iris)"}, \
    ] \
}




scoreboard players operation @s srn.world.id = #LOBBY_WORLD_TEMPLATE_ID srn.global
rotate @s ~ ~