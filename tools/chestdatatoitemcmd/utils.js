const { NBTools, getNbtContent } = require("../../NBTool.js")
const { toItemText } = require("../../mccommand.js")
try {
    function chestDataToItemCmd(inputNBT) {
        data = NBTools.ParseNBT(inputNBT);
        let res = ``;
        if(data.Items == null){
            return "";
        }
        for (let i = 0; i < data.Items.length; i++) {
            let it = data.Items[i];
            let Iid = getNbtContent(it.id);
            let Icount = getNbtContent(it.count);
            let Islot = getNbtContent(it.Slot);
            let Icomponents = it.components;
            if (Islot == null) continue
            if (Icount == null) Icount = 1;
            if (Icomponents == null) Icomponents = {};
            let ItemObj = {
                id: Iid,
                components: Icomponents
            };
            res += (res == "" ? "" : "\r\n") + `item replace block ~ ~ ~ container.${Islot} with ${toItemText(ItemObj)} ${Icount}`.trim()
        }
        return res;
    }
} catch (e) {
    return "## Error: " + e.message;
}


module.exports = { chestDataToItemCmd }
