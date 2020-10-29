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

pool.connect((err, client, done) => {
	console.log("connected");
})

client.on('ready', () => {
	console.log('Hello from London!');
	channel_sandbox = client.channels.cache.get(config.channels.sandbox);
	require('./recheckUsers').start(pool, client);
});

client.on('guildMemberAdd', member => {
	console.log('NEW MEMBER ' + member.displayName); 
	try{
		pool.query('SELECT * FROM public.members WHERE id = $1', [member.id], (err, results) => {
			if (err) throw err;			
			if(results.length != 0) return;

			pool.query('INSERT INTO members (id, name, inVoice) VALUES ($1, $2, 0)', [member.id, ''] , (err) => {
				if (err) throw err;
			});
		});
	} catch(e) {
		channel_sandbox.send('Ошибка ' + e.name + ":" + e.message + "\n<@" + config.users.developer + "> \n" + e.stack);
	}
});

client.on('raw', async event => {
	try{
		if (event.t == 'VOICE_STATE_UPDATE') {
			var inVoiceChannel = 
				event.d.channel_id != null && 
				event.d.channel_id != config.channels.afk;

			logVoiceEvent(inVoiceChannel, event);

			if(!inVoiceChannel || event.d.self_mute == true || event.d.self_deaf == true){
				pool.query('UPDATE public.members SET inVoice=false WHERE id = $1', [event.d.user_id], (err) => {
					if (err) throw err;
				});
			}else{
				pool.query('UPDATE public.members SET inVoice=true WHERE id = $1', [event.d.user_id], (err) => {
					if (err) throw err;
				});
			}	
		}
	} catch(e) {
		console.log('Ошибка ' + e.name + ":" + e.message + "\n<@" + config.users.developer + "> \n" + e.stack);
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
		" ; mic: "+ (event.d.self_mute ? "off" : "on ") +
		" ; speaker: "+ (event.d.self_deaf ? "off" : "on ");
	
	console.log(new Date() + " WaitingQuery: "+pool.waitingCount + "; " + event.d.user_id + 
				(inVoiceChannel ? " in" + inVoiceChannelLine : " out of voice"));
}