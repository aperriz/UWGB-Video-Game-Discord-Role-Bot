const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addroleall')
        .setDescription('Adds a role to all members in the server')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to add to all members')
                .setRequired(true)),

    async execute(interaction, client) {
        if(!interaction.member.permissions.has("ADMINISTRATOR")) {
            return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
        }

        try {
            const role = interaction.options.getRole('role');
            
            // get all members in the server
            const members = await interaction.guild.members.fetch();

            members.forEach(async member => {
                if (member.roles.cache.has(role.id)) {
                    console.log(`Role ${role.name} already exists for ${member.user.username}`);
                    return;
                }

                console.log(`Adding role ${role.name} to ${member.user.username}`);
                await member.roles.add(role);
            });

            await interaction.reply({content: `Role ${role.name} has been added to all members in the server`, ephemeral: true});
        }
        catch (e) {
            console.log(e);
            if(interaction.replied) return;
            fs.appendFile(`log.txt`, `${e}\n`, function (e) { });
            await interaction.reply({ content: `An error occurred: ${e}`, ephemeral: true });
        }
    },
};