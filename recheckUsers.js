const Discord = require("discord.js");
const config = require("./config.json");
const mysql = require('mysql'); 

exports.start = function (pool, client, killasexecuted) {
	var guild = client.guilds.cache.find(guild => guild.id == config.guild);
	var channel_sandbox = client.channels.cache.get(config.channels.sandbox);
	
	try{
		var counter = 0;
		guild.members.cache.each(function(member){
			pool.getConnection(function(err, connection) {
				if (err) throw err; // not connected!
				
				connection.query('SELECT * FROM members WHERE id = ?', member.id, function (err, results, fields) {
					if (err) throw err;
					else{
						if(results.length == 0){
							connection.query('INSERT INTO members (id, name, inVoice) VALUES (?, ?, 0)', [member.id, ''] , function(err, result) {
								console.log("Free pool: "+ pool._freeConnections.length + " ;  insert member: " + member.displayName);	
								if (err) throw err;
							});
						}
						
						console.log("Free pool: "+ pool._freeConnections.length + " ;  update member: " + member.displayName);
						var query = connection.query('UPDATE members SET inVoice= ? WHERE id = ?', 
							[((member.voiceChannelID == null || member.voiceChannelID == config.channels.afk || member.selfMute == true || member.selfDeaf == true) ? 0 : 1), member.id] , function(err, result) {
							if (err != null) throw err;
							else connection.release();
						});
					}
				});
				counter++;
				if(killasexecuted == true && counter == guild.members.cache.size) {
					setTimeout(function(){
						client.destroy();
						process.exit();
					}, 150);
				}
			});
		});
	} catch(e) {
		channel_sandbox.send('Ошибка ' + e.name + ":" + e.message + "\n<@" + config.users.developer + "> \n" + e.stack);
	}
}