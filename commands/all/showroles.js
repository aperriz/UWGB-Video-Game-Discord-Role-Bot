const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const buttonWrapper = require("../../utility_modules/buttonWrapper.js");
fs = require('fs').promises;
helpers = require("../../utility_modules/helpers.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('showroles')
        .setDescription("Shows reaction roles"),
    async execute(interaction) {
        var json;
        var int = interaction;
        fs.writeFile(`log.txt`, `showroles command used\n`, function (e) { });

        data = await fs.readFile('allowedroles.json', function e() { });

        if (interaction.member.roles.highest.position > interaction.guild.members.me.roles.highest.position || interaction.member.roles.cache.filter(role => role.name === "bot man")) {

            try {

                fs.appendFile(`log.txt`, `${data}\n`, function (e) { });
                fs.appendFile(`log.txt`, `Allowed roles read\n`, function (e) { });
                json = JSON.parse(data);

                const roles = interaction.guild.roles.cache.filter(role =>
                    // Check if the role is in the allowed roles
                    json.roles.find(r => r.role.toUpperCase() === role.name.toUpperCase())
                );
                if (roles.size == 0) {
                    interaction.reply({ content: "No roles to share!", ephemeral: true });
                } else {
                    console.log(roles.size);

                    var buttons = [];

                    // Create buttons for each role
                    roles.each(role =>
                        buttons.push(new ButtonBuilder()
                            .setCustomId(`${role.id}`)
                            .setLabel(`${role.name}`)
                            .setStyle(ButtonStyle.Secondary))
                    );

                    const embed = new EmbedBuilder()
                        .setColor("Blue")
                        .setTitle("Get your role(s)!")
                        .setDescription(`React with the buttons below to get roles!`);

                    fs.appendFile(`log.txt`, `Roles shown\n`, function (e) { });

                    const reply = await interaction.channel.send({ embeds: [embed], components: buttonWrapper(buttons) });

                    // Save the message id, guild id, and channel id to a file
                    fs.writeFile('messageInfo.json', JSON.stringify({ "messageId": reply.id, "guildId": interaction.guild.id, "channelId": interaction.channel.id }), function (e) { });

                    // Create a collector for the buttons
                    const collector = await interaction.channel.createMessageComponentCollector();

                    collector.on('collect', async (i) => {
                        try {
                            const member = i.member;
                            if (!member.roles.cache.find(r => r.id === i.customId)) {
                                // Add the role to the member
                                member.roles.add(i.customId);
                                i.reply({ content: `Added role ${i.guild.roles.cache.find(x => x.id === i.customId).name}!`, ephemeral: true });
                                console.log(`${i.guild.roles.cache.find(x => x.id === i.customId).name}\n${i.member.displayName}`);
                                fs.appendFile(`log.txt`, `${i.guild.roles.cache.find(x => x.id === i.customId).name}\n${i.member.displayName}\n`, function (e) { });
                                return;
                            }
                            else {
                                // Remove the role
                                member.roles.remove(i.customId);
                                i.reply({ content: `Removed role ${i.guild.roles.cache.find(x => x.id === i.customId).name}!`, ephemeral: true });
                                console.log(`${i.guild.roles.cache.find(x => x.id === i.customId).name}\n${i.member.displayName}`);
                                fs.appendFile(`log.txt`, `${i.guild.roles.cache.find(x => x.id === i.customId).name}\n${i.member.displayName}\n`, function (e) { });
                                return;
                            }
                        }
                        catch (e) {
                            console.log(e);
                            fs.appendFile(`log.txt`, `${e}\n`, function (f) { });
                        }
                    })

                    await interaction.reply({ content: "Done!", ephemeral: true });

                    // Reload the allowrole and disallowrole commands
                    helpers.reloadCommand(interaction.client.commands.get("allowrole"));
                    helpers.reloadCommand(interaction.client.commands.get("disallowrole"));
                }
            }
            catch (e) {
                if (!interaction.replied || interaction.defered) {
                    await interaction.reply({ content: "Something went wrong!", ephemeral: true });
                }
                else {
                    await interaction.followUp({ content: "Something went wrong!", ephemeral: true });
                }
                console.log(e);
                fs.appendFile(`log.txt`, `${e}\n`, function (f) { });
            }
        }
        else {
            if (!interaction.replied || interaction.defered) {
                interaction.reply({ content: "You do not have permission to use this command!", ephemeral: true });
            }
            else {
                interaction.followUp({ content: "You do not have permission to use this command!", ephemeral: true });
            }
        }
    }
}