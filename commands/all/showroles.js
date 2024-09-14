const {SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
fs = require('fs').promises;
helpers = require("../../helpers.js");

async function deleteMessage(interaction){
	try{
		d = await fs.readFile('messageInfo.json', function(e){});
		j = JSON.parse(d);
		
		const guild = await interaction.guild;
		const channel = await guild.channels.fetch(j.channelId);
		const message = await channel.messages.fetch(j.messageId);
		if(message){
            await message.delete();
            console.log("Deleted message");
            fs.appendFile(`log.txt`, `Deleted message\n`, function(e){});
        }
        else{
            console.log("Message not found");
            fs.appendFile(`log.txt`, `Message not found\n`, function(e){});
        }
		
	}
	catch(e){
		console.log(e);
		fs.appendFile(`log.txt`, `${e}\n`, function(e){});
	}
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('showroles')
        .setDescription("Shows reaction roles"),
    async execute(interaction){
        var json;
        var int = interaction;
        fs.writeFile(`log.txt`, `showroles command used\n`, function(e){});

        data = await fs.readFile('allowedroles.json', function e(){});

        if(interaction.member.roles.highest.position > interaction.guild.members.me.roles.highest.position || interaction.member.roles.cache.filter(role => role.name === "bot man")){
            
            await deleteMessage(int);
            
            try{
                
                fs.appendFile(`log.txt`, `${data}\n`, function(e){});
                fs.appendFile(`log.txt`, `Allowed roles read\n`, function(e){});
                json = JSON.parse(data);
    
                const roles = interaction.guild.roles.cache.filter(role => 
                    json.roles.find(r => r.role === role.name)
                );
                if(roles.size == 0){
                    interaction.reply({content: "No roles to share!", ephemeral:true});
                }else{
                    console.log(roles.size);
                    const actionRow = new ActionRowBuilder();
    
                    var buttons = [];
    
                    roles.each(role =>
                    buttons.push(new ButtonBuilder()
                    .setCustomId(`${role.id}`)
                    .setLabel(`${role.name}`)
                    .setStyle(ButtonStyle.Secondary))
                    );
                    
                    
                    actionRow.addComponents(
                        buttons
                    );
                    console.log(actionRow.components.length);
                    const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle("Get your role(s)!")
                    .setDescription(`React with the buttons below to get roles!`);

                    fs.appendFile(`log.txt`, `Roles shown\n`, function(e){});
    
                    const reply = await interaction.channel.send({embeds : [embed], components: [actionRow]});
    
                    fs.writeFile('messageInfo.json', JSON.stringify({"messageId" : reply.id, "guildId": interaction.guild.id, "channelId" : interaction.channel.id}), function(e){});


                    const collector = await interaction.channel.createMessageComponentCollector();
    
                    collector.on('collect', async (i) =>{
                        const member = i.member;
                        if(!member.roles.cache.find(r => r.id === i.customId)){
                            member.roles.add(i.customId);
                            i.reply({content: `Added role ${i.guild.roles.cache.find(x => x.id === i.customId).name}!`, ephemeral: true});
                            console.log(`${i.guild.roles.cache.find(x => x.id === i.customId).name}\n${i.member.displayName}`);
                            fs.appendFile(`log.txt`, `${i.guild.roles.cache.find(x => x.id === i.customId).name}\n${i.member.displayName}\n`, function(e){});
                            return;
                        }
                        else{
                            member.roles.remove(i.customId);
                            i.reply({content: `Removed role ${i.guild.roles.cache.find(x => x.id === i.customId).name}!`, ephemeral: true});
                            console.log(`${i.guild.roles.cache.find(x => x.id === i.customId).name}\n${i.member.displayName}`);
                            fs.appendFile(`log.txt`, `${i.guild.roles.cache.find(x => x.id === i.customId).name}\n${i.member.displayName}\n`, function(e){});
                            return;
                        }
                    })
    
                    await interaction.reply({content: "Done!", ephemeral: true});

                    helpers.reloadCommand(interaction.client.commands.get("allowrole"));
                    helpers.reloadCommand(interaction.client.commands.get("disallowrole"));
                }
            }
            catch (e){
                await interaction.reply({content: "Something went wrong!", ephemeral: true});
                console.log(e);
                fs.appendFile(`log.txt`, `${e}\n`, function(f){});
            }
        }
        else{
            interaction.reply({content: "You do not have permission to use this command!", ephemeral:true});
        }
    }
}