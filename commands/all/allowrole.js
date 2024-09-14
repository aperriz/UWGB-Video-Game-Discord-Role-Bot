const {SlashCommandBuilder, heading} = require("discord.js");
fs = require('fs');
helpers = require("../../helpers.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('allowrole')
        .setDescription(`Allows role to be added`)
        .addRoleOption(option =>
            option.setName("role").setDescription("Role to Allow").setRequired(true)
        ),

    async execute(interaction){

        try{
            fs.readFile('allowedroles.json', function (err, data) {
                var json = JSON.parse(data)
                if(!json.roles.some(role => role.role === interaction.options.getRole("role").name)){
                    json.roles.push({"role": interaction.options.getRole("role").name
                    });
                    pushed = true;
                    fs.writeFile("allowedroles.json", JSON.stringify(json, null, 2), (writeErr) => {
                        if (writeErr) {
                            console.error('Error writing file:', writeErr);
                            return;
                        }
                        console.log('Data appended successfully!');
                    });
                }
            })
            
            await interaction.reply({content: `Allow role ${interaction.options.getRole("role")}`, ephemeral: true});
            
        }   
        catch{
            await interaction.reply({content: "Failed to Allow role!", ephemeral: true});
        }

        helpers.reloadCommand(interaction.client.commands.get("showroles"));
        helpers.reloadCommand(interaction.client.commands.get("disallowrole"));
    }
}