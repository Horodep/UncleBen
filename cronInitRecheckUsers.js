const Discord = require("discord.js");
const { Pool } = require('pg');

const config = require("./config.json");
	
const client = new Discord.Client();
client.login(config.discordApiKey);

const pool = new Pool({
	host: config.sql.host,
	database: config.sql.database,
	user: config.sql.username,
	password: config.sql.password,
	port: 5432,
	max: 10
});


client.on('ready', () => {
	console.log(new Date() + " init");
	require('./recheckUsers').start(pool, client, true);
})