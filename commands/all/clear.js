const {SlashCommandBuilder} = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription(`Deletes my messages`),
    async execute(interaction){
	if(interaction.member.roles.highest.position > interaction.guild.members.me.roles.highest.position || interaction.member.roles.cache.filter(role => role.name === "bot man")){
        	const fetched = await interaction.channel.messages.fetch({limit: 100});

        	const messages = fetched.filter(msg => msg.author.id === interaction.guild.members.me.id);

        	messages.forEach(async(msg) =>{
            		await msg.delete();
       		});

        	await interaction.reply({content: `${messages.size} messages deleted`, ephemeral: true});
        }
    }
}