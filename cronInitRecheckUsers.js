const Discord = require("discord.js");
const mysql = require('mysql'); 

const config = require("./config.json");
	
const client = new Discord.Client();
client.login(config.discordApiKey);

var pool = mysql.createPool({
	connectionLimit : 10,
	host     : config.mysql.host,
	user     : config.mysql.username,
	password : config.mysql.password,
	database : config.mysql.database,
	charset  : config.mysql.charset
});


client.on('ready', () => {
	console.log(new Date() + " init");
	require('./recheckUsers').start(pool, client, true);
})