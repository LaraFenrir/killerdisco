const { Client } = require('discord.js');
const yt = require('ytdl-core');
const client = new Client();
const prefix = "kd!";
let queue = {};

client.on('message', msg => {
client.user.setPresence({ game: { name: 'kd!help | Alpha Version', type: 1 } });
});










client.on("message", (message) => {
  // Exit and stop if the prefix is not there or if user is a bot
  if (!message.content.startsWith(prefix) || message.author.bot) return;
});



const commands = {
	'play': (msg) => {
		if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`Ajoutez une musique avec ${prefix}add`);
		if (!msg.guild.voiceConnection) return commands.join(msg).then(() => commands.play(msg)).then(() => dispatcher.setVolume(Math.min((dispatcher.volume*10))));
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
	'reboot': (msg) => {
		if (msg.author.id == "216926828802211842") process.exit(); //Requires a node module like Forever to work.
	},
	'ban': (msg) => {
		  var user = msg.mentions.users.first();
  var params = msg.content.replace(cmd + "ban ", "").split(" ");
   console.log("▬▬▬▬ LOGS ▬▬▬▬\nUser ID :"+msg.author.id+"\nServer: "+msg.guild.name+"\nUsername: "+msg.author.username+"\nCommand: kd!ban\n ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ")
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
    console.log("▬▬▬▬ LOGS ▬▬▬▬\nUser ID :"+msg.author.id+"\nServer: "+msg.guild.name+"\nUsername: "+msg.author.username+"\nCommand: kd!kick\n ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ")
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
	},
	'bs': (msg) => {
const os = require('os'); 
  console.log("▬▬▬▬ LOGS ▬▬▬▬\nUser ID :"+msg.author.id+"\nServer: "+msg.guild.name+"\nUsername: "+msg.author.username+"\nCommand: kd!bs\n ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ")
  let upTime = Math.round(os.uptime());
 let upTime1 = Math.round(process.uptime());
     let upTimeSeconds2 = upTime1;
        let upTimeOutput2 = "";
        if (upTime<60) {
            upTimeOutput2 = `${upTime1}s`;
        } else if (upTime1<3600) {
            upTimeOutput2 = `${Math.floor(upTime1/60)} minutes ${upTime1%60} secondes`;
        } else if (upTime1<86400) {
            upTimeOutput2 = `${Math.floor(upTime1/3600)} heures ${Math.floor(upTime1%3600/60)} minutes ${upTime1%3600%60} secondes`;
        } else if (upTime1<604800) {
            upTimeOutput2 = `${Math.floor(upTime1/86400)} jours ${Math.floor(upTime1%86400/3600)} heures ${Math.floor(upTime1%86400%3600/60)} minutes ${upTime%86400%3600%60} secondes`;
        }
         let upTimeSeconds = upTime;
        let upTimeOutput = "";

        if (upTime<60) {
            upTimeOutput = `${upTime} secondes`;
        } else if (upTime<3600) {
            upTimeOutput = `${Math.floor(upTime/60)} minutes ${upTime%60} secondes`;
        } else if (upTime<86400) {
            upTimeOutput = `${Math.floor(upTime/3600)} heures ${Math.floor(upTime%3600/60)} minutes ${upTime%3600%60} secondes`;
        } else if (upTime<604800) {
            upTimeOutput = `${Math.floor(upTime/86400)} jours ${Math.floor(upTime%86400/3600)} heures ${Math.floor(upTime%86400%3600/60)} minutes ${upTime%86400%3600%60} secondes`;
        }
let embed_fields = [{
                name: "Informations Système",
                value: `Plateforme : ${process.platform}-${process.arch}\n ${process.release.name}\n Version : ${process.version.slice(1)}\n`,
                inline: true
            },
            {
                name: "Créateur",
                value: `Killerkoas#2141`,
                inline: true
            },
            {
                name: "ID Processus",
                value: `${process.pid}`,
                inline: true
            },
            {
                name: "Utilisation de la mémoire du processeur",
                value: `${Math.ceil(process.memoryUsage().heapTotal / 1000000)} MB`,
                inline: true
            },
            {
                name: "Utilisation de la mémoire du système",
                value: `${Math.ceil((os.totalmem() - os.freemem()) / 1000000)} / ${Math.ceil(os.totalmem() / 1000000)} MB`,
                inline: true
            },
            {
                name: "Durée de fonctionnement de l'ordinateur",
                value: `:clock12: ${upTimeOutput}`,
                inline: true
            },
            {
                name: "Durée de fonctionnement du bot",
                value: `:clock1230: ${upTimeOutput2}`,
                inline: true
            },{
                name: 'Librairie',
                value: `**Discord.js**`,
                inline: true
            },
            {
                name: "Serveur Discord",
                value: `[Discord](https://discord.gg/wh3wftk)`,
                inline: true
            },
            {
                name: "Nombres de serveurs",
                value: client.guilds.size,
                inline: true
            },
            {
                name: "Nombres d'utilisateurs",
                value: client.users.size,
                inline: true
            },
            {
                name: "Nombres de channels",
                value: client.channels.size,
                inline: true
            }
        ];

        msg.channel.send({
            embed: {
                author: {
                    name: "Killer Diamond",
                    icon_url: client.avatarURL,
                    url:'https://discordapp.com/oauth2/authorize?client_id=388728293492260875&scope=bot&permissions=1610083447'
                },
                color: 0x00FF00,
                fields: embed_fields
            }
        });
	   },
	'ping': (msg) => {
	console.log("▬▬▬▬ LOGS ▬▬▬▬\nUser ID :"+msg.author.id+"\nServer: "+msg.guild.name+"\nUsername: "+msg.author.username+"\nCommand: kd!ping\n ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ")
  startTime = Date.now();
  msg.channel.sendMessage("Calcul en cours...").then((message) => {
    endTime = Date.now();
     message.edit("Bot : " + Math.round(endTime - startTime) + " ms\nAPI : "+Math.round(client.ping)+" ms");
  });
	},
	'say': (msg) => {
	if (msg.author.bot) return;
  var args = msg.content.split(" ");
  args.splice(0, 1);
  args = args.join(" ");
  msg.channel.send(args+"\nRequête de "+msg.author+".");
  msg.delete(prefix+"say")
   console.log("▬▬▬▬ LOGS ▬▬▬▬\nUser ID :"+msg.author.id+"\nServer: "+msg.guild.name+"\nUsername: "+msg.author.username+"\nCommand: k!say\n ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ")	
	},
	'osay': (msg) => {
	if (msg.author.id !== "392441246238375936") return msg.channel.sendMessage("Permission insuffisante.")
  var args = msg.content.split(" ");
  args.splice(0, 1);
  args = args.join(" ");
  msg.channel.send(args);
  msg.delete(prefix+"say")	
	},
	'invite': (msg) => {
	msg.channel.sendMessage("Voici mon lien d'invitation :tickets: > https://discordapp.com/oauth2/authorize?client_id=419167328165560331&scope=bot&permissions=-1")	
	},
	'eval': (msg) => {
		const params = msg.content.split(" ");
const args = msg.content.split(" ").slice(1);
function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}
  if(msg.author.id === "392441246238375936") {
    try {
         var code = args.join(" ");
         var evaled = eval(code);

         if (typeof evaled !== "string") {
           evaled = require("util").inspect(evaled);
         }
         msg.channel.sendMessage(":floppy_disk:  Output:")
         msg.channel.sendCode("xl", clean(evaled));
       } catch(err) {
         msg.channel.sendMessage(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
       }
     } else {
    msg.channel.sendMessage("Vous n'avez pas accès à cette commande !");
  };
     },
     'help': (msg) => {
	 msg.channel.send("", {
          embed: {
            title: "Commande Aide",
            description: `
           **Musique :**\n
		kd!add <url> (Ajoute une musique via un lien YouTube)\n kd!play (Joue la première musique de la playlist)\n kd!pause (Met en pause la musique)\n kd!resume (Reprend la musique)\n kd!volume+ (Augmente le volume de 5%)\n kd!volume- (Baisse le volume de 5%)\n kd!time (Affiche le temps écoulé de la musique en minutes & secondes)\n kd!queue (Affiche la playlist)\n
	   **Modération :**\n
		kd!ban <@mention> <raison> (Bannir un membre du serveur)\n kd!kick <@mention <raison> (Kick un membre du serveur)\n
	   **Utilitaires & Informations :**\n
		kd!bs (Affiche des informations du bot)\n kd!ping (Affiche le ping du bot & de l'API)\n kd!say <message> (Tada :tada: ! Le bot parlera désormais grâce à cette commande !)\n kd!sl (Affiche le nombres de serveurs + leurs noms )\n kd!avatar <@mention> ou kd!avatar (Affiche votre avatar ou celui de quelqu'un d'autres en le mentionnant)\n kd!invite (Envoi un message pour inviter le bot sur d'autres serveurs)
            `,
            timestamp: new Date(),
            color: 0x4077FF
          }});    
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
