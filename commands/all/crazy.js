const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crazy')
        .setDescription('I was crazy once...'),
    
    async execute(interaction) {
        // Your command logic here
        await interaction.reply('Crazy? I was crazy once... They put me in a rubber room. A rubber room with rats. And the rats made me crazy.');
    },
};