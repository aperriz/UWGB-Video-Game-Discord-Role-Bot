const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription(`Deletes my messages`),
	async execute(interaction) {
		try{
			if (interaction.member.roles.highest.position > interaction.guild.members.me.roles.highest.position || interaction.member.roles.cache.filter(role => role.name === "bot man")) {
				const fetched = await interaction.channel.messages.fetch({ limit: 100 });
	
				const messages = fetched.filter(msg => msg.author.id === interaction.guild.members.me.id);
	
				const m = [];
	
				messages.forEach(async (msg) => {
					m.push(msg);
				});
	
				await interaction.channel.bulkDelete(m);
	
				await interaction.reply({ content: `${messages.size} messages deleted`, ephemeral: true });
			}
		}
		catch(e){
			console.log(e);
			fs.appendFile(`log.txt`, `${e}\n`, function (e) { });
		}
	}
}