const { Client } = require('discord.js');
const yt = require('ytdl-core');
const client = new Client();
const prefix = "kd!";
let queue = {};

const commands = {
	'play': (msg) => {
		if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`Ajoutez une musique avec ${prefix}add`);
		if (!msg.guild.voiceConnection) return commands.join(msg).then(() => commands.play(msg));
		if (queue[msg.guild.id].playing) return msg.channel.sendMessage('Je joue déjà une musique');
		let dispatcher;
		queue[msg.guild.id].playing = true;

		console.log(queue);
		(function play(song) {
			console.log(song);
			if (song === undefined) return msg.channel.sendMessage('La playlist est vide.').then(() => {
				queue[msg.guild.id].playing = false;
				msg.member.voiceChannel.leave();
			});
			msg.channel.sendMessage(`Joue : **${song.title}**\nRequête de :**${song.requester}**`);
			dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }));
			let collector = msg.channel.createCollector(m => m);
			collector.on('message', m => {
				if (m.content.startsWith(prefix + 'pause')) {
					msg.channel.sendMessage('Musique en pause.').then(() => {dispatcher.pause();});
				} else if (m.content.startsWith(prefix + 'resume')){
					msg.channel.sendMessage('Musique reprise.').then(() => {dispatcher.resume();});
				} else if (m.content.startsWith(prefix + 'skip')){
					msg.channel.sendMessage('Musique passée.').then(() => {dispatcher.end();});
				} else if (m.content.startsWith(prefix +'volume+')){
					if (Math.round(dispatcher.volume*50) >= 100) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.min((dispatcher.volume*50 + (5*(m.content.split('+').length-1)))/50,2));
					msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith(prefix +'volume-')){
					if (Math.round(dispatcher.volume*50) <= 0) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.max((dispatcher.volume*50 - (5*(m.content.split('-').length-1)))/50,0));
					msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith(prefix + 'time')){
					msg.channel.sendMessage(`Temps : ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
				}
			});
			dispatcher.on('end', () => {
				collector.stop();
				play(queue[msg.guild.id].songs.shift());
			});
			dispatcher.on('error', (err) => {
				return msg.channel.sendMessage('Erreur: ' + err).then(() => {
					collector.stop();
					play(queue[msg.guild.id].songs.shift());
				});
			});
		})(queue[msg.guild.id].songs.shift());
	},
	'join': (msg) => {
		return new Promise((resolve, reject) => {
			const voiceChannel = msg.member.voiceChannel;
			if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('Je ne peux pas me connecter à votre salon ! ``VOICE_CHANNEL_NOT_FOUND``');
			voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
		});
	},
	'add': (msg) => {
		let url = msg.content.split(' ')[1];
		if (url == '' || url === undefined) return msg.channel.sendMessage(`Vous devez ajouter une musique que avec YouTube. Commande : ${prefix}add`);
		yt.getInfo(url, (err, info) => {
			if(err) return msg.channel.sendMessage('Ereur lié à YouTube : ' + err);
			if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
			queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username});
			msg.channel.sendMessage(`Ajout de **${info.title}** à la playlist.`);
		});
	},
	'queue': (msg) => {
		if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`La playlist est vide, ajouter une musique avec ${prefix}add`);
		let tosend = [];
		queue[msg.guild.id].songs.forEach((song, i) => { tosend.push(`${i+1}. ${song.title} - Requête par : ${song.requester}`);});
		msg.channel.sendMessage(`**${tosend.length}** musiques dans la playlist ${(tosend.length > 15 ? '*[Seulement 15 musiques apparaissent]*' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
	},
	'help': (msg) => {
		let tosend = ['```xl', prefix + 'join : "Join Voice channel of msg sender"', prefix + 'add : "Add a valid youtube link to the queue"', prefix + 'queue : "Shows the current queue, up to 15 songs shown."', prefix + 'play : "Play the music queue if already joined to a voice channel"', '', 'the following commands only function while the play command is running:'.toUpperCase(), prefix + 'pause : "pauses the music"',	prefix + 'resume : "resumes the music"', prefix + 'skip : "skips the playing song"', prefix + 'time : "Shows the playtime of the song."',	'volume+(+++) : "increases volume by 2%/+"',	'volume-(---) : "decreases volume by 2%/-"',	'```'];
		msg.channel.sendMessage(tosend.join('\n'));
	},
	'reboot': (msg) => {
		if (msg.author.id == "242682458083033089") process.exit(); //Requires a node module like Forever to work.
	},
	'ban': (msg) => {
		  var user = msg.mentions.users.first();
  var params = msg.content.replace(cmd + "ban ", "").split(" ");
   console.log("▬▬▬▬ LOGS ▬▬▬▬\nUser ID :"+msg.author.id+"\nServer: "+msg.guild.name+"\nUsername: "+msg.author.username+"\nCommand: k!ban\n ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ")
    var cmd = "kd!";
var reasonban = msg.content.replace(params[0] + " ", "").replace(cmd + "ban ", "");
const iconURL = "https://media.discordapp.net/attachments/403246036396670986/403249675534204938/giphy.gif"


      if (!msg.guild.member(msg.author).hasPermission("BAN_MEMBERS")) {
        msg.reply("**Une erreur est survenu**\n Raison : Vous n'avez pas la permission **BAN_MEMBERS**")
        return;
      }

      if (user == null) {
        msg.channel.send("", {
          embed: {
            title: "Aide - Ban",
            description: `
            Pour bannir une personne : kd!ban @user (raison)
            N'oubliez pas de mentionner l'utilisateur.
            `,
            timestamp: new Date(),
            color: 0x4077FF
          }});
        return;
      }

      if (reasonban == null || reasonban == "" || params[0] == null || params[1] == null) {
        msg.channel.send("", {
          embed: {
            title: "Aide - Ban",
            description: `
            Pour bannir une personne : k!ban @user (raison)
            N'oubliez pas de mentionner l'utilisateur.
            `,
            timestamp: new Date(),
            color: 0x4077FF
          }
        });
        return;
      }

      if (!msg.channel.guild.member(user).bannable) {
        msg.channel.sendMessage(":no_entry_sign: Je ne peux pas bannir l'utilisateur mentionné **"+msg.author.username+"** :no_entry_sign:");
        return;
      }

      var banner = "";
      var banned = "";

      if (msg.channel.guild.member(msg.author).nickname == null) {
        banner = msg.author.username;
      } else {
        banner = msg.channel.guild.member(msg.author).nickname;
      }

      if (msg.channel.guild.member(user).nickname == null) {
        banned = user.username;
      } else {
        banned = msg.channel.guild.member(user).nickname;
      }

      user.sendMessage(msg.author.username + "#" + msg.author.discriminator + " vous a banni du serveur " + msg.guild.name + "\n Raison : **" + reasonban + "**.");

      setTimeout(function () {
        msg.channel.guild.member(user).ban()
          .then(() => {
            msg.channel.sendMessage("Utilisateur banni avec succès !\n Modérateur:"+msg.author.username+" \n ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n Informations à propos de l'utilisateur banni :\n Pseudonyme : "+user+"\n Raison : **" + reasonban +"**\n");
            console.log("▬▬▬▬ Utilisateur Banni ▬▬▬▬\n Modérateur:"+msg.author.username+"\n Serveur: "+msg.guild.name+"\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n Informations à propos de l'utilisateur banni :\n Pseudonyme : "+user+"\n Raison : " + reasonban +"\n")
          })
          .catch(err => {
            msg.reply(`\`${err}\``);
            return;
          });
      }, 1000);
	},
	'kick': (msg) => {
var params = msg.content.replace(cmd + "kick ", "").split(" ");
const iconURL = "https://media.discordapp.net/attachments/403246036396670986/403249675534204938/giphy.gif"

var user = msg.mentions.users.first();
    console.log("▬▬▬▬ LOGS ▬▬▬▬\nUser ID :"+msg.author.id+"\nServer: "+msg.guild.name+"\nUsername: "+msg.author.username+"\nCommand: k!kick\n ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ")
        var cmd = "kd!";
var reasonkick = msg.content.replace(params[0] + " ", "").replace(cmd + "ban ", "");
      if (!msg.guild.member(msg.author).hasPermission("KICK_MEMBERS")) {
        msg.reply("**Une erreur est survenu**\n Raison : Vous n'avez pas la permission **KICK_MEMBERS**")
        return;
      }


      if (user == null) {
        msg.channel.send("", {
          embed: {
            title: "Aide - Kick",
            description: `
            Pour kick une personne : kd!kick @user (raison)
            N'oubliez pas de mentionner l'utilisateur.
            `,
            timestamp: new Date(),
            color: 0x4077FF
          }});
        return;
      }

      if (reasonkick == null || reasonkick == "" || params[0] == null || params[1] == null) {
        msg.channel.send("", {
          embed: {
            title: "Aide - Kick",
            description: `
            Pour kick une personne : k!kick @user (raison)
            N'oubliez pas de mentionner l'utilisateur.
            `,
            timestamp: new Date(),
            color: 0x4077FF
          }});
        return;
      }

      if (!msg.channel.guild.member(user).bannable) {
        msg.reply(":no_entry_sign: Je ne peux pas kick l'utilisateur mentionné **"+msg.author.username+"** :no_entry_sign:");
        return;
      }

      user.sendMessage(msg.author.username + "#" + msg.author.discriminator + " vous a kick de " + msg.guild.name + "\nRaison: **" + reasonkick + "**.\n");

      setTimeout(function () {
        msg.channel.guild.member(user).kick()
          .then(() => {
            msg.channel.sendMessage("L'utilisateur "+user+" a été kick du serveur !");
          })
          .catch(err => {
            msg.reply(`\`${err}\``);
            return;
          });
      }, 1000);
	},
	'avatar': (msg) => {
  let user = msg.mentions.users.first() ? msg.mentions.users.first() : msg.author
  let ava = user.displayAvatarURL
  let embed = {
      color:0x542437,
      description:"Voici l'avatar de **"+user.username+"** *[URL]("+ava+")*",
      image:{url:ava}
  }
  msg.channel.send("", {embed});
	},
	'sl': (msg) => {
		var servers = client.guilds.array().map(g => g.name).join(' \n');
   msg.channel.sendMessage("Nombres de serveurs : **" + client.guilds.size + "** ")
   msg.channel.sendMessage("", {embed: {
      title: "Liste des serveurs",
      color: 00229,
      description: " "+servers+" ",
    }}).catch(console.error);
	}
	
};      
	

client.on('ready', () => {
	console.log('▬▬▬▬▬▬▬▬▬▬▬▬\nConnecté à Discord\n▬▬▬▬▬▬▬▬▬▬▬▬');
});

client.on('message', msg => {
	if (!msg.content.startsWith(prefix)) return;
	if (commands.hasOwnProperty(msg.content.toLowerCase().slice(prefix.length).split(' ')[0])) commands[msg.content.toLowerCase().slice(prefix.length).split(' ')[0]](msg);
});
client.login(process.env.TOKEN);
