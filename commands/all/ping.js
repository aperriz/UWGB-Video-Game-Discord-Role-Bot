const {SlashCommandBuilder} = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription(`Returns pong`),
    async execute(interaction){
        await interaction.reply({content: "Pong!", ephemeral: true});
    }
}