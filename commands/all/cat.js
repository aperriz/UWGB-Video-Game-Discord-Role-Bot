const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat')
        .setDescription('Sends a random cat picture')
        .addStringOption(option => option.setName('tag').setDescription('Image tag').setRequired(false)),
    async execute(interaction) {
        let url;
        if (interaction.options.getString('tag')) {
            const tag = interaction.options.getString('tag');
            url = `https://cataas.com/cat/${tag}`;
        } else {
            url = 'https://cataas.com/cat';
        }

        const response = await fetch(url);
        const buffer = await response.buffer();
        const attachment = new AttachmentBuilder(buffer, { name: 'cat.jpg' });

        await interaction.reply({ files: [attachment] });
    },
};
