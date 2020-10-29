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
	max: 10,
	//idleTimeoutMillis: 1000,
	//connectionTimeoutMillis: 3000
});

var channel_sandbox;

client.on('ready', () => {
	console.log('Hello from London!');
	channel_sandbox = client.channels.cache.get(config.channels.sandbox);
	//require('./recheckUsers').start(pool, client);
});

client.on('guildMemberAdd', member => {
	console.log('NEW MEMBER ' + member.displayName); 
	try{
		/*pool.getConnection(function(err, connection) {
			if (err) throw err; // not connected!
			
			connection.query('SELECT * FROM members WHERE id = ?', member.id, function (err, results, fields) {
				if (err) throw err;
				
				if(results.length == 0){
					connection.query('INSERT INTO members (id, name, inVoice) VALUES (?, ?, 0)', [member.id, ''] , function(err, result) {
						if (err) throw err;
						connection.release();
					});
				}else connection.release();
			});
		});*/
	} catch(e) {
		channel_sandbox.send('Ошибка ' + e.name + ":" + e.message + "\n<@" + config.users.developer + "> \n" + e.stack);
	}
});

client.on('raw', async event => {
	try{
		if (event.t == 'VOICE_STATE_UPDATE') {
			pool.query('SELECT * FROM users WHERE id = $1', [1], (err, res) => {
				if (err) {
				  throw err
				}
				console.log('user:', res.rows[0])
			  })
			  

			pool.getConnection(function(err, connection) {
				if (err) throw err; // not connected!
				
				var inVoiceChannel = 
					event.d.channel_id != null && 
					event.d.channel_id != config.channels.afk;

				logVoiceEvent(inVoiceChannel, event);

				if(!inVoiceChannel || event.d.self_mute == true || event.d.self_deaf == true){
					connection.query('UPDATE members SET inVoice=0 WHERE id = ?', event.d.user_id, function(err, result) {
						if (err) throw err;
						connection.release();
					});
				}else{
					connection.query('UPDATE members SET inVoice=1 WHERE id = ?', event.d.user_id, function(err, result) {
						if (err) throw err;
						connection.release();
					});
				}
			});
		}
	} catch(e) {
		channel_sandbox.send('Ошибка ' + e.name + ":" + e.message + "\n<@" + config.users.developer + "> \n" + e.stack);
	}
});

client.on('message', (message) => {
	try {
		if (!message.author.bot && message.content.startsWith("!")){
			var args = message.content.substring(1).split(' ');

			switch(args[0]) {
				case "uncle":
					channel_sandbox.send("Here!");
					break;
				default:
					break;
			}
		}
	} catch(e) {
		channel_sandbox.send('Ошибка ' + e.name + ":" + e.message + "\n<@" + config.users.developer + "> \n" + e.stack);
	}
});

function logVoiceEvent(inVoiceChannel, event){
	var inVoiceChannelLine = 
		" ; mic: "+ (event.d.self_mute ? "off" : "on") +
		" ; speaker: "+ (event.d.self_deaf ? "off" : "on");
	
	console.log(new Date() + " Free: "+pool._freeConnections.length + "; " + event.d.user_id + 
				(inVoiceChannel ? " in" + inVoiceChannelLine : " out of voice"));
}