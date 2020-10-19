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
		
	var channel_sandbox = client.channels.cache.get(config.channels.sandbox);
	var guild = client.guilds.cache.find(guild => guild.id == config.guild);
	
	try{
		var counter = 0;
		guild.members.cache.forEach(function(member){
			pool.getConnection(function(err, connection) {
				if (err) throw err; // not connected!
				
				connection.query('SELECT * FROM members WHERE id = ?', member.id, function (err, results, fields) {
					if (err) throw err;
					else{
						console.log(counter +"Free pool: "+ pool._freeConnections.length + " ;    " + "gained answer: " + member.displayName);
						if(results.length == 0){
							connection.query('INSERT INTO members (id, name, inVoice) VALUES (?, ?, 0)', [member.id, ''] , function(err, result) {
								console.log(counter+"Free pool: "+ pool._freeConnections.length + " ;    " + member.id + " " + member.displayName);	
								if (err) throw err;
								else{
									var query = connection.query('UPDATE members SET inVoice= ? WHERE id = ?', 
												[((member.voiceChannelID == null || member.voiceChannelID == config.channels.afk || member.selfMute == true || member.selfDeaf == true) ? 0 : 1), member.id] , function(err, result) {
										if (err != null) throw err;
										else connection.release();
									});
								}
							});
						}else{
							var query = connection.query('UPDATE members SET inVoice= ? WHERE id = ?', 
										[((member.voiceChannelID == null || member.voiceChannelID == config.channels.afk || member.selfMute == true || member.selfDeaf == true) ? 0 : 1), member.id] , function(err, result) {
								if (err != null) throw err;
								else connection.release();
							});
						}
					}
				});
				counter++;
				if(counter == guild.members.cache.size) {
					setTimeout(function(){
						client.destroy();
						process.exit();
					}, 150);
				}
			});
		});
	} catch(e) {
		channel_sandbox.send('Ошибка ' + e.name + ":" + e.message + "\n<@149245139389251584> \n" + e.stack);
	}
})