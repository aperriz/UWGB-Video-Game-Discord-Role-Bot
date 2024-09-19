const { AttachmentBuilder, SlashCommandBuilder } = require('discord.js');
const Canvas = require('canvas');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hawk')
        .setDescription('I like hawks.')
        .addUserOption(option => option.setName('user').setDescription("Target").setRequired(false)),
    async execute(interaction) {
        try {
            // Load the user's avatar
            const user = interaction.options.getUser('user') || interaction.user;
            const avatarURL = user.displayAvatarURL({ extension: 'png', size: 128 });
            fs.appendFile(`log.txt`, `${avatarURL}\n`, function (e) { });

            const avatar = await Canvas.loadImage(avatarURL);
            fs.appendFile(`log.txt`, `Set avatar const\n`, function (e) { });

            // Load the hawk image
            fs.appendFile(`log.txt`, `${__dirname}\n`, function (e) { });
            const hawkPath = path.join(__dirname, '../../meme stuff/hawk.png');
            console.log(hawkPath);
            fs.appendFile(`log.txt`, `${hawkPath}\n`, function (e) { });
            const hawk = await Canvas.loadImage(hawkPath);

            // Create a canvas and draw both images
            const canvas = Canvas.createCanvas(628, 618);
            const ctx = canvas.getContext('2d');

            // Draw the hawk image
            ctx.drawImage(hawk, 0, 0, canvas.width, canvas.height);

            // Draw the user's avatar on top of the hawk image
            const avatarSize = 100;
            ctx.drawImage(avatar, dx=510 - (avatarSize - (avatarSize - 64)), dy= 475 - (avatarSize - (avatarSize - 64)), dw=avatarSize*1.75, dh=avatarSize*1.75);

            // Create an attachment and send it
            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'hawktuah.png' });
            await interaction.reply({ files: [attachment] });
        }
        catch (e) {
            console.log(e);
            fs.appendFile(`log.txt`, `${e}\n`, function (e) { });
            await interaction.reply({ content: 'Failed to create the hawk image.', ephemeral: true });
        }
    }
};
