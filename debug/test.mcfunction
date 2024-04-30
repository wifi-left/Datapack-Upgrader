##
## Datapack Upgrader v1.0.0 by wifi_left
## If you encounter a problem, make an issue on https://github.com/wifi-left/Datapack-Upgrader
## 
# item replace entity @s armor.chest with minecraft:leather_chestplate{display:{color:15488341},Unbreakable:1b,HideFlags:63,Enchantments:[{id:"minecraft:protection",lvl:1s},{id:"fire_protection",lvl:1}]}
# item replace entity @s armor.head with minecraft:note_block{Unbreakable:1b,Enchantments:[{id:"binding_curse",lvl:1}]}
# item replace entity @s armor.feet with minecraft:leather_boots{display:{color:15488341},Unbreakable:1b,Enchantments:[{id:"blast_protection",lvl:1}]}
# item replace entity @s armor.legs with minecraft:leather_leggings{display:{color:15488341},Unbreakable:1b,Enchantments:[{id:"fire_protection",lvl:1}]}
# item replace entity @s container.0 with minecraft:red_dye{Unbreakable:1b,display:{Name:'["§4Red §bSword"]',Lore:['["§c5 HP"]']},Enchantments:[{id:"unbreaking",lvl:1}],HideFlags:63,AttributeModifiers:[{AttributeName:"generic.attack_damage",Name:"noName",Amount:5d,Operation:0,UUID:[I;4894,7942,7863,6495],Slot:mainhand},{AttributeName:"generic.attack_speed",Amount:-2.2,Slot:"mainhand",Operation:0,UUID:[I;1145,5145,1145,5145]}]} 1
# give @s minecraft:snowball{Enchantments:[{id:"unbreaking",lvl:1}],display:{Name:'"\\u00a74\\u00a7lFIREBALL"',Lore:['"\\u00a7bTEST LORE"']},HideFlags:63} 4

particle minecraft:dust{color:[0.059, 0.973, 0.439],scale:1} ~ ~ ~ 0 0 0 1 1
give @s diamond[custom_name='"\\u00a7a1"']
execute as @a[team=wait.jobpvp] at @s run kill @e[type=item,distance=0..6,nbt=!{Item:{components:{"minecraft:custom_data":{job_pvp:1}}}}]
scoreboard players reset @a[tag=!riding,scores={GCAR.long=-1..}] GCAR.long
## WARNING: The transformation may cause problem. You might need to modify it by yourself.
data modify entity @e[limit=1,type=item,tag=sur.loot.new] Item.components."minecraft:bundle_contents" set from entity @s Inventory


