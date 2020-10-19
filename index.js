const Discord = require("discord.js");
//const mysql = require('mysql');

const config = require("./config.json");
	
const client = new Discord.Client();
client.login(config.discordApiKey);

/*var pool = mysql.createPool({
	connectionLimit : 10,
	host     : config.mysql.host,
	user     : config.mysql.username,
	password : config.mysql.password,
	database : config.mysql.database,
	charset  : config.mysql.charset
});*/

var channel_sandbox;

function init(){
	channel_sandbox = client.channels.get(keys.sandbox());
	var guild = client.guilds.find(guild => guild.id == "471020862045290496");
	
	console.log(new Date() + " init");
	
	guild.members.forEach(function(member){
		pool.getConnection(function(err, connection) {
			if (err) throw err; // not connected!
			
			connection.query('SELECT * FROM members WHERE id = ?', member.id, function (err, results, fields) {
				if (err) throw err;
				else{
					console.log("Free pool: "+ pool._freeConnections.length + " ;    " + "gained answer: " + member.displayName);
					if(results.length == 0){
						connection.query('INSERT INTO members (id, name, inVoice) VALUES (?, ?, 0)', [member.id, ''] , function(err, result) {
							console.log("Free pool: "+ pool._freeConnections.length + " ;    " + member.id + " " + member.displayName);	
							if (err) throw err;
							else{
								var query = connection.query('UPDATE members SET inVoice= ? WHERE id = ?', 
											[((member.voiceChannelID == null || member.voiceChannelID == "596738623714361344" || member.selfMute == true || member.selfDeaf == true) ? 0 : 1), member.id] , function(err, result) {
									if (err != null) throw err;
									else connection.release();
								});
							}
						});
					}else{
						var query = connection.query('UPDATE members SET inVoice= ? WHERE id = ?', 
									[((member.voiceChannelID == null || member.voiceChannelID == "596738623714361344" || member.selfMute == true || member.selfDeaf == true) ? 0 : 1), member.id] , function(err, result) {
							if (err != null) throw err;
							else connection.release();
						});
					}
				}
			});
		});
	});
}

client.on('ready', () => {
	console.log('Hello from London!');
	
	channel_sandbox = client.channels.cache.get(config.channels.sandbox);
	//init();
	/*
	var date = new Date();
	setInterval(
		function(){ 
			date = new Date(); 
			if(date.getMinutes() === 30 && date.getHours()%2 === 0){
				try {	
					init();
				} catch(e) {
					channel_sandbox.send('Ошибка ' + e.name + ":" + e.message + "\n<@149245139389251584> \n" + e.stack);
				}
			}
		}, 
	1000*60*1);*/
});

client.on('raw', async event => {
	/*try{
		if (event.t == 'VOICE_STATE_UPDATE') {
			pool.getConnection(function(err, connection) {
				if (err) console.log(err); // not connected!
				
				if(event.d.channel_id == null || event.d.channel_id == "596738623714361344"){
					var query = connection.query('UPDATE members SET inVoice=0 WHERE id = ?', event.d.user_id, function(err, result) {
						if (err) throw err;
						else {
							console.log(new Date() + " Free: "+pool._freeConnections.length + "; " + event.d.user_id + " out of voice");
							connection.release();
						}
					});
				}else{
					if(event.d.self_mute == true || event.d.self_deaf == true){
						var query = connection.query('UPDATE members SET inVoice=0 WHERE id = ?', event.d.user_id, function(err, result) {
							if (err) throw err;
							else {
								console.log(new Date() + " Free: "+pool._freeConnections.length + "; " + event.d.user_id + " in "+
											"; mic: "+ (event.d.self_mute ? "off" : "on ")+
											"; speaker: "+ (event.d.self_deaf ? "off" : "on "));
								connection.release();
							}
						});
					}else{
						var query = connection.query('UPDATE members SET inVoice=1 WHERE id = ?', event.d.user_id, function(err, result) {
							if (err) throw err;
							else {
							console.log(new Date() + " Free: "+pool._freeConnections.length + "; " + event.d.user_id + " in "+
										"; mic: "+ (event.d.self_mute ? "off" : "on ")+
										"; speaker: "+ (event.d.self_deaf ? "off" : "on "));
								connection.release();
							}
						});
					}
				}
			});
		}
	} catch(e) {
		channel_sandbox.send('Ошибка ' + e.name + ":" + e.message + "\n<@149245139389251584> \n" + e.stack);
	}*/
});

client.on('message', (message) => {
	try {
		if (!message.author.bot){
			if (message.content.substring(0, 1) == '!') {
				var args = message.content.substring(1).split(' ');
				var cmd = args[0];
				var date = new Date();
				//console.log(date + ' ' + message.author.username + ' '+ message.content); 
			   
				switch(cmd) {
					default:
						break;
				}
			}
		}
	} catch(e) {
		message.channel.send('Ошибка ' + e.name + ":" + e.message + "\n<@149245139389251584> \n" + e.stack);
	}
});