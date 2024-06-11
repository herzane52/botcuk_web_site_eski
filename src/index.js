const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token, mongodbUri } = require('./data/config.json');
const { MongoClient } = require('mongodb');
const logger = require('silly-logger');

const topGG = false;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });



const dbClient =  new MongoClient(String(mongodbUri));
(async function dbSetup() {
	await dbClient.connect();
	client.dbClient = dbClient;
	logger.success("Mongodb bağlantısı başarılı.");
	client.login(token);
} ());

if (topGG) {
	const discordBotListToken = require('./data/config.json');
	const { AutoPoster } = require('topgg-autoposter');
	const ap = AutoPoster(`${String(discordBotListToken)}`, client);

	ap.on('posted', (stats) => {
		logger.success(`İstatistikler Top.gg'de yayınlandı | ${stats.serverCount} sunucu`);
	});

	ap.on('error', (err) => {
		logger.error(err);
	});
}




const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

  




