async function reloadCommand(command){
    delete require.cache[require.resolve(`./${command.data.name}.js`)];

    try {
        const newCommand = require(`./${command.data.name}.js`);
        interaction.client.commands.set(newCommand.data.name, newCommand);
        await interaction.reply({content:`Command \`${newCommand.data.name}\` was reloaded!`, ephemeral:true});
    } catch (error) {
        console.error(error);
        await interaction.reply({content: `There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``, ephemeral:true});
    }
}