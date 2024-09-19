const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getavatar')
        .setDescription(`Get a user's avatar`)
        .addUserOption(option => option.setName('user').setDescription('The user to get the avatar of').setRequired(false)),
        
    async execute(interaction) {
        try {
            let user = interaction.options.getUser('user') || interaction.user;
            await interaction.reply({ content: `Here is ${user.username}'s avatar:`, files: [user.displayAvatarURL({ format: 'png', dynamic: true })], ephemeral: true });
        }
        catch (e) {
            console.log(e);
            fs.appendFile(`log.txt`, `${e}\n`, function (e) { });
        }
    }
}