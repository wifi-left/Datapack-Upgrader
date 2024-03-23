# 转换前
give @s firework_rocket{Fireworks:{Explosions:[{Type:2,Trail:1,Colors:[I;12801229],FadeColors:[I;2437522]}],Flight:2}}
give @s oak_sign{BlockEntityTag:{front_text:{messages:['"\\u00a7a111"']}}}

# 转换后
give @s firework_rocket[fireworks={explosions:[{shape:"star",color:[I;12801229],fade_colors:[I;2437522],has_trail:1,has_twinkle:false}],flight_duration:2}]
## WARNING: We found that you used 'BlockEntityTag' tag for your item. You need to add a 'id' tag (for example: 'id: "minecraft:oak"') due to new changes.
give @s oak_sign[block_entity_data={front_text:{messages:["\"\\u00a7a111\""]}},block_state={front_text:{messages:["\"\\u00a7a111\""]}},custom_model_data={front_text:{messages:["\"\\u00a7a111\""]}}]