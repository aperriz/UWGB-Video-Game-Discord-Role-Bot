// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const { token } = require('./config.json');
const fs = require("node:fs");
const fsp = require("fs").promises;
const path = require("node:path");
helpers = require("./helpers.js");
const { data } = require('./commands/all/showroles');

async function deleteMessage(){
	try{
		d = await fsp.readFile('messageInfo.json', function(e){});
		j = JSON.parse(d);
		
		const guild = await client.guilds.fetch(j.guildId);
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

async function createMessage(){
	try{d = await fsp.readFile('messageInfo.json', function(e){});
	j = JSON.parse(d);

	da = await fsp.readFile('allowedroles.json', function e(){});
    js = JSON.parse(da);

	guild = await client.guilds.fetch(j.guildId);
	channel = await guild.channels.fetch(j.channelId);

	const roles = guild.roles.cache.filter(role => 
		js.roles.find(r => r.role === role.name)
	);
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

	const reply = await channel.send({embeds : [embed], components: [actionRow]});
	console.log(reply.id);
	fs.appendFile(`log.txt`, `${reply.id}\n`, function(e){});

	await fsp.writeFile('messageInfo.json', JSON.stringify({"messageId" : reply.id, "guildId": guild.id, "channelId" : channel.id}), function(e){});

	const collector = await channel.createMessageComponentCollector();

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
	})}
	catch(e){
		console.log(e);
		fs.appendFile(`log.txt`, `${e}\n`, function(e){});
	}
}

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMembers] });
// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
	try{
		createMessage();
	}
	catch(e){
		console.log(e);
		fs.appendFile(`log.txt`, `${e}\n`, function(e){});
		helpers.reloadCommand(readyClient.commands.get("showroles"));
		helpers.reloadCommand(readyClient.commands.get("allowrole"));
		helpers.reloadCommand(readyClient.commands.get("disallowrole"));
	}
});

// Log in to Discord with your client's token
client.login(token);

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const log = fs.writeFile(`log.txt`, "Initialized log file", function(e){});

for(const folder of commandFolders){
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			fs.appendFile(`log.txt`, `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.\n`, function(e){});
		}
	}
}


client.on(Events.InteractionCreate, async interaction =>{
    if(!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if(!command){
        console.error(`No command matching ${interaction.commandName} was found`);
		fs.appendFile(`log.txt`, `No command matching ${interaction.commandName} was found\n`, function(e){});
        return;
    }

    try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			fs.appendFile(`log.txt`, `There was an error while executing this command!\n`, function(e){});
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			fs.appendFile(`log.txt`, `There was an error while executing this command!\n`, function(e){});
		}
	}

    console.log(interaction);
	fs.appendFile(`log.txt`, `${interaction}\n`, function(e){});

	process.on('SIGINT', async () => {
		console.log('Received SIGINT. Shutting down gracefully...');
		fs.appendFile(`log.txt`, `Received SIGINT. Shutting down gracefully...\n`, function(e){});

		await deleteMessage();

		// Place your cleanup code here
		await client.destroy(); // This will log out the bot
		console.log('Bot has been destroyed. Exiting process.');

		process.exit(0);
	});
	
	process.on('SIGTERM', async () => {
		console.log('Received SIGTERM. Shutting down gracefully...');
		fs.appendFile(`log.txt`, `Received SIGTERM. Shutting down...\n`, function(e){});

		await deleteMessage();
		// Place your cleanup code here
		await client.destroy(); // This will log out the bot
		console.log('Bot has been destroyed. Exiting process.');
		process.exit(0);
	});
})

