clear @s diamond[custom_data~{a:1},enchantments={aqua_affinity:1},custom_name="你好呀"]
clear @s iron_axe[custom_data={a:2},enchantments~[{enchantments:["aqua_affinity"]}],!custom_name="1"]
tellraw @s ["你好呀！再见！","你好呀","再见！"]
execute align xyz as @e[type=!#iris:ignore, tag=!iris.ignore, dx=0, dy=0, dz=0, tag=!iris.executing] run function iris:get_hitbox/entity