item replace entity @s hotbar.2 with breeze_rod[\
    minecraft:consumable = {consume_seconds:0,animation:"none",sound:"block.amethyst_cluster.fall",has_consume_particles:false},\
    minecraft:use_cooldown = {seconds:2,cooldown_group:"game:mutation"},\
    minecraft:custom_data = {"rightclick":true,"no_return":true,"command":"\
        function game:morphs/morph_cat\
    "},\
    minecraft:item_name = {"text":"Morph to Cat","italic":false},\
    minecraft:max_stack_size = 1,\
    item_model="cat_spawn_egg"\
]
item replace entity @s hotbar.3 with breeze_rod[\
    minecraft:consumable = {consume_seconds:0,animation:"none",sound:"block.amethyst_cluster.fall",has_consume_particles:false},\
    minecraft:use_cooldown = {seconds:2,cooldown_group:"game:mutation"},\
    minecraft:custom_data = {"rightclick":true,"no_return":true,"command":"\
        function game:morphs/morph_parrot\
    "},\
    minecraft:item_name = {"text":"Morph to Parrot","italic":false},\
    minecraft:max_stack_size = 1,\
    item_model="parrot_spawn_egg"\
]
item replace entity @s hotbar.4 with breeze_rod[\
    minecraft:consumable = {consume_seconds:0,animation:"none",sound:"block.amethyst_cluster.fall",has_consume_particles:false},\
    minecraft:use_cooldown = {seconds:2,cooldown_group:"game:mutation"},\
    minecraft:custom_data = {"rightclick":true,"no_return":true,"command":"\
        function game:morphs/morph_enderman\
    "},\
    minecraft:item_name = {"text":"Morph to Enderman","italic":false},\
    minecraft:max_stack_size = 1,\
    item_model="enderman_spawn_egg"\
]
item replace entity @s hotbar.5 with breeze_rod[\
    minecraft:consumable = {consume_seconds:0,animation:"none",sound:"block.amethyst_cluster.fall",has_consume_particles:false},\
    minecraft:use_cooldown = {seconds:2,cooldown_group:"game:mutation"},\
    minecraft:custom_data = {"rightclick":true,"no_return":true,"command":"\
        function game:morphs/morph_silverfish\
    "},\
    minecraft:item_name = {"text":"Morph to Silverfish","italic":false},\
    minecraft:max_stack_size = 1,\
    item_model="silverfish_spawn_egg"\
]
tellraw @s ["Hello, world!",["This is wifi_left"]]