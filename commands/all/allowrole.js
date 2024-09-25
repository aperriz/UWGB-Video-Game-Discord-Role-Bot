const {SlashCommandBuilder, heading} = require("discord.js");
const { waitForDebugger } = require("inspector");
fs = require('fs').promises;
helpers = require("../../utility_modules/helpers.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('allowrole')
        .setDescription(`Allows role to be added`)
        .addRoleOption(option =>
            option.setName("role").setDescription("Role to Allow").setRequired(true)
        ),

    async execute(interaction){

        pushed = false;
        read = false;

        try{
            await fs.readFile('allowedroles.json', async function (err, data) {
                console.log("File read\n");
                await fs.appendFile(`log.txt`, `File read\n`, function (e) { });

                if(err){
                    console.log(err);
                    fs.appendFile(`log.txt`, `${err}\n`, function (e) { });
                    interaction.reply({content: `Failed to Allow role! ${e}`, ephemeral: true});
                    return;
                }

                read = true;
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
                else{
                    pushed = false;
                }
            })
            
            if(pushed){
                await interaction.reply({content: `Allow role ${interaction.options.getRole("role")}`, ephemeral: true});
            }
            else if (read){
                await interaction.reply({content: `Role ${interaction.options.getRole("role")} already allowed!`, ephemeral: true});
            }
            else{
                await interaction.reply({content: "Failed to Allow role! (not read)", ephemeral: true});
            }
            
        }   
        catch (e) {
            await interaction.reply({content: "Failed to Allow role!", ephemeral: true});
            fs.appendFile(`log.txt`, `${e}\n`, function (e) { });
            console.log(e);
        }
        
    }
}