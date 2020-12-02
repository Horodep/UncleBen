const config = require("./config.json");

exports.start = function (pool, client, killAsExecuted) {
	var guild = client.guilds.cache.find(guild => guild.id == config.guild);
	var channel_sandbox = client.channels.cache.get(config.channels.sandbox);
	
	try{
		var counter = 0;
		console.log(guild.members.cache.size);
		guild.members.cache.each(function(member){
			pool.query('SELECT * FROM public.members WHERE id = $1',[member.id], (err, results) => {
				if (err) throw err;
				if(results.rowCount == 0){
					pool.query('INSERT INTO public.members (id, name, inVoice) VALUES ($1, $2, false)', [member.id, ''] , (err) => {
						if (err) throw err;
						console.log("WaitingQuery: "+pool.waitingCount + "; insert member " + member.displayName);	
					});
				}
				
				var inVoice = !(
					member.voice.channelID == null || 
					member.voice.channelID == config.channels.afk || 
					member.voice.selfMute == true || 
					member.voice.selfDeaf == true);
				
				pool.query('UPDATE public.members SET inVoice=$1 WHERE id = $2', [inVoice, member.id] , (err) => {
					if (err) throw err;
					console.log("WaitingQuery: "+pool.waitingCount + "; update member " + member.displayName);	
				});
			});
			counter++;
			if(killAsExecuted == true && counter == guild.members.cache.size) {
				setTimeout(function(){
					client.destroy();
					process.exit();
				}, 150);
			}
		});
	} catch(e) {
		channel_sandbox.send('Ошибка ' + e.name + ":" + e.message + "\n<@" + config.users.developer + "> \n" + e.stack);
	}
}