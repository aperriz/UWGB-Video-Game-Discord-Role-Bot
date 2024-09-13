const {SlashCommandBuilder} = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription(`Adds role to target user (admin only)`)
        .addRoleOption(option =>
            option.setName("role").setDescription("Target role").setRequired(true))
        .addUserOption(option =>
            option.setName("user").setDescription("Target user").setRequired(false)),
    async execute(interaction){

        role = interaction.options.getRole('role');

        if(interaction.options.getUser("user") != ("" || null)){
            user = interaction.options.getUser("user");
            user = await interaction.guild.members.fetch(user.id);
        }
        else{
            user = interaction.member;
        }

        if(interaction.member.roles.cache.find(r => r.name === ("president" || "Bot Man"))){
            console.log(user.displayName);
            console.log(user.roles);
            if(!user.roles.cache.find(r => r === role)){
                try {
                    await user.roles.add(role);
                    await interaction.reply({content: `Successfully added the role "${role.name}" to ${user.displayName}!`, ephemeral:true});
                    return;
                } catch (error) {
                    console.error(error);
                    await interaction.reply({content: 'I was unable to add the role. Please check my permissions.', ephemeral: true});
                    return;
                }
            }
            else{
                await interaction.reply({content: `${user.displayName} already has role ${role.name}`, ephemeral: true});
            }
            return;
        }

        await interaction.reply({content: "This command is for admins only!", ephemeral: true});

        const command = interaction.client.commands.get("showroles");

        delete require.cache[require.resolve(`./${command.data.name}.js`)];

        try {
            const newCommand = require(`./${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
        } catch (error) {
            console.error(error);
        }
    }
}