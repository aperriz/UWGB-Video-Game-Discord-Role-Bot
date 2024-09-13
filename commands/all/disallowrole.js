const {SlashCommandBuilder} = require("discord.js");
fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disallowrole')
        .setDescription(`Allows role to be removed`)
        .addRoleOption(option =>
            option.setName("role").setDescription("Role to remove").setRequired(true)
        ),

    async execute(interaction){
        console.log("e'e'e'e");
        try{
            fs.readFile('allowedroles.json', function (err, data) {
                var json = JSON.parse(data);
                console.log(json);
                console.log(json.roles.indexOf(r => r.role = interaction.options.getRole("role").name));
                if(json.roles.some(role => role.role === interaction.options.getRole("role").name)){
                    json.roles.splice(json.roles.indexOf(r => r.role = interaction.options.getRole("role").name, 1)
                    );
                    fs.writeFile("allowedroles.json", JSON.stringify(json, null, 2), (writeErr) => {
                        if (writeErr) {
                            console.error('Error writing file:', writeErr);
                            return;
                        }
                        console.log('Data appended successfully!');
                    });
                }
            })
            
            await interaction.reply({content: `Disallowed role ${interaction.options.getRole("role")}`, ephemeral: true});
            
            
        }   
        catch{
            await interaction.reply({content: "Failed to disallow role!", ephemeral: true});
        }

        const commands = ["showroles", "allowrole"];

        commands.forEach(c => {
            console.log(c);
            const command = interaction.client.commands.get(c);

            delete require.cache[require.resolve(`./${c}.js`)];

            try {
                const newCommand = require(`./${c}.js`);
                interaction.client.commands.set(c, newCommand);
            } catch (error) {
                console.error(error);
            }
        });
    }
}