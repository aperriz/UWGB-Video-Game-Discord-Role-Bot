const {SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
fs = require('fs').promises;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('showroles')
        .setDescription("Shows reaction roles"),
    async execute(interaction){
        var json;

        if(interaction.member.roles.highest.position > interaction.guild.members.me.roles.highest.position || interaction.member.roles.cache.filter(role => role.name === "bot man")){
            try{
                data = await fs.readFile('allowedroles.json', function e(){});
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
    
                    await interaction.channel.send({embeds : [embed], components: [actionRow]});
    
                    const collector = await interaction.channel.createMessageComponentCollector();
    
                    collector.on('collect', async (i) =>{
                        const member = i.member;
                        if(!member.roles.cache.find(r => r.id === i.customId)){
                            member.roles.add(i.customId);
                            i.reply({content: `Added role ${i.guild.roles.cache.find(x => x.id === i.customId).name}!`, ephemeral: true});
                            console.log(`${i.guild.roles.chache.find(x => x.id === i.customId).name}\n${i.member.displayName}`);
                            return;
                        }
                        else{
                            i.reply({content:"You already have this role!", ephemeral: true});
                            return;
                        }
                    })
    
                    await interaction.reply({content: "Done!", ephemeral: true});
                }
            }
            catch (e){
                await interaction.reply({content: "Something went wrong!", ephemeral: true});
                console.log(e);
            }
        }
        else{
            interaction.reply({content: "You do not have permission to use this command!", ephemeral:true});
        }
    }
}