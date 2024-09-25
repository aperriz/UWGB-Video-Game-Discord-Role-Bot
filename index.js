// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { token } = require('./config.json');
const fs = require("node:fs");
const fsp = require("fs").promises;
const path = require("node:path");
const helpers = require("./utility_modules/helpers.js");
const buttonWrapper = require('./utility_modules/buttonWrapper.js');

fs.copyFile('log.txt', 'last-log.txt',
	(err) => {
		if (err) {
			console.log(err);
			throw err;
		}
		console.log('log.txt was copied to last-log.txt');
	});

async function createEmbed() {
	// Parse JSON file
	da = await fsp.readFile('allowedroles.json', function e() { });

	d = await fsp.readFile('messageInfo.json', function e() { });
	j = JSON.parse(d);

	const guild = await client.guilds.fetch(j.guildId);
	fs.appendFile(`log.txt`, `${guild.id}\n`, function (e) { });

	fs.appendFile(`log.txt`, `Allowed roles read\n`, function (e) { });
	json = JSON.parse(da);

	// Get the roles that are allowed to be shared
	const roles = guild.roles.cache.filter(role =>
		json.roles.find(r => r.role.toUpperCase() === role.name.toUpperCase())
	);

	console.log(roles.size);

	var buttons = [];

	// Create buttons for each role
	roles.each(role =>
		buttons.push(new ButtonBuilder()
			.setCustomId(`${role.id}`)
			.setLabel(`${role.name}`)
			.setStyle(ButtonStyle.Secondary))
	);


	console.log(buttons.length);

	// Try to create the embed
	try{
		
		const embed = new EmbedBuilder()
			.setColor("Blue")
			.setTitle("Get your role(s)!")
			.setDescription(`React with the buttons below to get roles!`);

		fs.appendFile(`log.txt`, `Roles shown\n`, function (e) { });

		console.log(buttons.length);
		fs.appendFile(`log.txt`, `Buttons: ${buttons.length}\n`, function (e) { });

		return {
			content: ""
			, embeds: [embed]
			, components: buttonWrapper(buttons)
		};

	}
	catch (e) {
		console.log(e);
		fs.appendFile(`log.txt`, `${e}\n`, function (f) { });
	}
}

async function editMessage(status) {
	fs.appendFile(`log.txt`, `Editing message\n`, function (e) { });

	try {
		d = await fsp.readFile('messageInfo.json', function (e) { });
		j = JSON.parse(d);

		// Get the message to edit
		const guild = await client.guilds.fetch(j.guildId);
		const channel = await guild.channels.fetch(j.channelId);
		const message = await channel.messages.fetch(j.messageId);

		// Edit the message
		if (status === "dead") {
			await message.edit({ content: "Bot is offline", components: [] });
			fs.appendFile(`log.txt`, `Bot is offline\n`, function (e) { });
			return;
		}
		else {
			await message.edit(await createEmbed());
			fs.appendFile(`log.txt`, `Embed created\n`, function (e) { });
			return;
		}
	}
	catch (e) {
		console.log(e);
		fs.appendFile(`log.txt`, `${e}\n`, function (e) { });
	}
}

async function createCollector() {

	try {
		d = await fsp.readFile('messageInfo.json', function (e) { });
		j = JSON.parse(d);

		// Get the message to create a collector for
		const guild = await client.guilds.fetch(j.guildId);
		const channel = await guild.channels.fetch(j.channelId);
		const message = await channel.messages.fetch(j.messageId);

		const collector = await message.createMessageComponentCollector();

		// Create a collector for the message
		collector.on('collect', async (i) => {
			const member = i.member;
			if (!member.roles.cache.find(r => r.id === i.customId)) {
				member.roles.add(i.customId);

				if(!i.replied){
					await i.reply({ content: `Added role ${i.guild.roles.cache.find(x => x.id === i.customId).name}!`, ephemeral: true });
				}

				console.log(`${i.guild.roles.cache.find(x => x.id === i.customId).name}\n${i.member.displayName}`);
				fs.appendFile(`log.txt`, `${i.guild.roles.cache.find(x => x.id === i.customId).name}\n${i.member.displayName}\n`, function (e) { });
				return;
			}
			else {
				member.roles.remove(i.customId);
				
				if(!i.replied){
					await i.reply({ content: `Removed role ${i.guild.roles.cache.find(x => x.id === i.customId).name}!`, ephemeral: true });
				}
				
				console.log(`${i.guild.roles.cache.find(x => x.id === i.customId).name}\n${i.member.displayName}`);
				fs.appendFile(`log.txt`, `${i.guild.roles.cache.find(x => x.id === i.customId).name}\n${i.member.displayName}\n`, function (e) { });
				return;
			}
		});
	}
	catch (e) {
		console.log(e);
		fs.appendFile(`log.txt`, `${e}\n`, function (e) { });
	}

}

async function reloadCommands() {
	// Reload all commands
	helpers.reloadCommand(client.commands.get("showroles"));
	helpers.reloadCommand(client.commands.get("allowrole"));
	helpers.reloadCommand(client.commands.get("disallowrole"));
}

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMembers] });

// Set the client in the helpers module
helpers.client = client;

// When the client is ready, run this code
client.once(Events.ClientReady, async readyClient => {
	helpers.client = client;
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	await fsp.writeFile('log.txt', 'Initialized log file\n', function (e) { });

	try {
		
		editMessage("alive");
		createCollector();
	}
	catch (e) {
		console.log(e);
		fs.appendFile(`log.txt`, `${e}\n`, function (e) { });
	}
});

// Log in to Discord with your client's token
client.login(token);

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Grab all the command files from the commands directory
for (const folder of commandFolders) {
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
			fs.appendFile(`log.txt`, `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.\n`, function (e) { });
		}
	}
}

// Listen for commands
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) {
		return;
	};

	try {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found`);
			fs.appendFile(`log.txt`, `No command matching ${interaction.commandName} was found\n`, function (e) { });
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				fs.appendFile(`log.txt`, `There was an error while executing this command!\n`, function (e) { });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				fs.appendFile(`log.txt`, `There was an error while executing this command!\n`, function (e) { });
			}
		}

		//console.log(interaction);
		await fsp.appendFile(`log.txt`, `\n\n\n${interaction}\n\n\n`, function (e) { });

	}
	catch (e) {
		console.log(e);
		fs.appendFile(`log.txt`, `${e}\n`, function (e) { });
	}
})

// Listen for crazy
client.on(Events.MessageCreate, async message => {
	if (message.content.toUpperCase().contains(" CRAZY ") && message.author.id !== client.user.id && !message.replied) {
		message.reply("Crazy? I was crazy once... They put me in a rubber room. A rubber room with rats. And the rats made me crazy.");
	}
	else if(message.author.id !== client.user.id){
		console.log(`${message.author.username}: ${message.content}`);
		fs.appendFile(`log.txt`, `${message.author.username}: ${message.content}\n`, function (e) { });
	}
	console.log(message.content);
});

// Handle process signals
process.on('SIGINT', async () => {
	console.log('Received SIGINT. Shutting down gracefully...');
	fs.appendFile(`log.txt`, `Received SIGINT. Shutting down gracefully...\n`, function (e) { });

	await editMessage("dead");

	// Place your cleanup code here
	await client.destroy(); // This will log out the bot
	console.log('Bot has been destroyed. Exiting process.');

	process.exit(0);
});

process.on('SIGTERM', async () => {
	console.log('Received SIGTERM. Shutting down gracefully...');
	fs.appendFile(`log.txt`, `Received SIGTERM. Shutting down...\n`, function (e) { });

	await editMessage("dead");

	// Place your cleanup code here
	await client.destroy(); // This will log out the bot
	console.log('Bot has been destroyed. Exiting process.');
	process.exit(0);
});

// On uncaught exceptions, log the error and exit the process
process.on('uncaughtException', async (err) => {
	console.error(err);
	fs.appendFile(`log.txt`, `${err}\n`, function (e) { });
	await editMessage("dead");
	await client.destroy();
	process.exit(1);
});