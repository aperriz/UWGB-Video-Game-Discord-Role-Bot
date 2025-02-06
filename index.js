// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { token } = require('./config.json');
const fs = require("node:fs");
const fsp = require("fs").promises;
const path = require("node:path");
const helpers = require("./utility_modules/helpers.js");
const buttonWrapper = require('./utility_modules/buttonWrapper.js');
const sql3 = require("sqlite3");

const guildId = 1278446701505679454;
const db = openDb();

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

function openDb() {
	return new sql3.Database('./activityDatabase.db', (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Connected to the activityDatabase.db database.');
	});
}

async function createTable() {
	await db.exec(`
		CREATE TABLE IF NOT EXISTS activity (
			memberid INTEGER PRIMARY KEY,
			last_interaction DATETIME
		)
	`);
}

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMembers,
	 GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Set the client in the helpers module
helpers.client = client;

// When the client is ready, run this code
client.once(Events.ClientReady, async readyClient => {
	
	await createTable();

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

	const guild = client.guilds.cache.get("1278446701505679454");
	const members = await guild.members.fetch();

	members.forEach(async member => {
		const stmt = await db.prepare("INSERT OR IGNORE INTO activity (memberid, last_interaction) VALUES (?, ?)");
		await stmt.run(member.id, new Date().toISOString());
		await stmt.finalize();
		updateLastInteraction(member);
	});

	checkActivity();
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

// On member join, add unverified role
client.on(Events.GuildMemberAdd, async member => {
	console.log(`Member joined: ${member.user.username}`);
	fs.appendFile(`log.txt`, `Member joined: ${member.user.username}\n`, function (e) { });
	member.roles.add("1291245256976633907");

	const stmt = db.prepare("INSERT OR IGNORE INTO activity (memberid, last_interaction) VALUES (?, ?)");
	stmt.run(member.id, new Date().toISOString());
	stmt.finalize();
})

client.on(Events.GuildMemberRemove, async member => {
	const stmt = db.prepare("DELETE FROM activity WHERE memberid = ?");
	stmt.run(member.id);
	stmt.finalize();
});

async function updateLastInteraction(member) {
	const stmt = db.prepare("UPDATE activity SET last_interaction = ? WHERE memberid = ?");
	stmt.run(new Date().toISOString(), member.id);
	stmt.finalize();

	const inactiveRole = member.guild.roles.cache.find(role => role.id === "1335715137864073246"); // Replace with your inactive role ID
	if (inactiveRole && member.roles.cache.has(inactiveRole.id) && !member.roles.cache.has(1291225788775010398)) {
		await member.roles.remove(inactiveRole);
		fs.appendFile(`log.txt`, `Removed inactive role from ${member.user.username}\n`, function (e) { });
	}

	const activeRole = member.guild.roles.cache.find(role => role.id === "1335715443284901949"); // Replace with your active role ID
	if (activeRole && !member.roles.cache.has(activeRole.id)) {
		await member.roles.add(activeRole);
		fs.appendFile(`log.txt`, `Added active role to ${member.user.username}\n`, function (e) { });
	}
}

client.on(Events.InteractionCreate, async interaction => {
	
	await updateLastInteraction(interaction.member);

	if (!interaction.isChatInputCommand()) return;

	try {
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found`);
			fs.appendFile(`log.txt`, `No command matching ${interaction.commandName} was found\n`, function (e) { });
			return;
		}
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
});

client.on(Events.MessageCreate, async message => {
	if (message.author.bot) return;

	await updateLastInteraction(message.member);

	if (message.content.toLowerCase().includes('crazy')) {
		if (!message.replied) {
			await message.reply("Crazy? I was crazy once, They locked me in a room, a rubber room, a rubber room with rats, and rats make me crazy.");
		}
	}

	if (message.channel.id === "1291244805560602654" && message.attachments.size > 0) {
		await new Promise(r => setTimeout(r, 86400000));
		await message.delete();
	}
});

client.on(Events.GuildMemberAdd, async member => {
	console.log(`Member joined: ${member.user.username}`);
	fs.appendFile(`log.txt`, `Member joined: ${member.user.username}\n`, function (e) { });
	member.roles.add("1291245256976633907");

	const stmt = db.prepare("INSERT OR IGNORE INTO activity (memberid, last_interaction) VALUES (?, ?)");
	stmt.run(member.id, new Date().toISOString());
	stmt.finalize();
});

client.on(Events.GuildMemberRemove, async member => {
	const stmt = db.prepare("DELETE FROM activity WHERE memberid = ?");
	stmt.run(member.id);
	stmt.finalize();
});

async function checkActivity() {

	const oneMonthAgo = new Date();
	oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

	db.all("SELECT memberid, last_interaction FROM activity", async (err, rows) => {
		if (err) {
			console.error(err);
			fs.appendFile(`log.txt`, `${err}\n`, function (e) { });
			return;
		}

		for (const row of rows) {
			const lastInteraction = new Date(row.last_interaction);
			if (lastInteraction < oneMonthAgo) {
				const guild = client.guilds.cache.get(guildId); // Replace with your guild ID
				const member = await guild.members.fetch(row.memberid);
				if (member) {
					member.roles.add("1335715137864073246"); // Replace with your inactive role ID
					fs.appendFile(`log.txt`, `Added inactive role to ${member.user.username}\n`, function (e) { });
				}
			}
		}
	});

	// Wait a day and check again
	setTimeout(checkActivity, 86400000);

}


async function initializeDB(){
	
}

/***************************************************************
********************* Process events ***************************
***************************************************************/

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