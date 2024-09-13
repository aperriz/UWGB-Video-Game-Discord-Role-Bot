const { IntentsBitField } = require("discord.js");

module.exports = {
	data: {
        name: "reload",
        description: "Reloads command",
        "integration_types":[0,1],
        "contexts":[0, 1, 2],
        "options":[
            {
                "name":"command",
                "description":"Command to reload",
                "type":3,
                "required":true
            }
        ]
    },
	async execute(interaction) {
		const commandName = interaction.options.getString('command', true).toLowerCase();
        const command = interaction.client.commands.get(commandName);

        if (!command) {
            return interaction.reply({content:`There is no command with name \`${commandName}\`!`, ephemeral:true});
        }

        delete require.cache[require.resolve(`./${command.data.name}.js`)];

        try {
            const newCommand = require(`./${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply({content:`Command \`${newCommand.data.name}\` was reloaded!`, ephemeral:true});
        } catch (error) {
            console.error(error);
            await interaction.reply({content: `There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``, ephemeral:true});
        }

	},
};