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
		if (msg.author.id == "216926828802211842") process.exit(); //Requires a node module like Forever to work.
	},
	'ban': (message) => {
 let modRole = message.guild.roles.find("name", "Mod");
if(!message.member.roles.has(modRole.id)) {
  return message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :no_entry_sign: Vous n'avez pas la permissions d'utiliser cette commande ! :no_entry_sign: ",
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
      } 
    if(!message.guild.roles.exists("name", "Mod")) {
        return  message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :no_entry_sign: Le rôle **Mod** n'existe pas dans ce serveur veuillez le créer pour Kick! :no_entry_sign: ",
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
      } 
if(message.mentions.users.size === 0) {
  return message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :no_entry_sign: Merci de spécifié l'utilisateur que vous voulez Kick. **Format ~> `kd!ban @mention`** ! :no_entry_sign: ",
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
}
let banMember = message.guild.member(message.mentions.users.first());
if(!banMember) {
  return message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :x:  L\'utilisateur que vous avez entré n'est pas valide ! :x:",
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
}
if(!message.guild.member(client.user).hasPermission("BAN_MEMBERS")) {
  return message.reply("Je n'ai pas la permissions ** __(BAN_MEMBERS)__ **!").catch(console.error);
}
         if(!message.guild.channels.exists("name", "admin-logs")){
// créer le channel
message.guild.createChannel('admin-logs');
// Affiche un message d'erreur expliquant que le channel n'existait pas
return message.channel.sendMessage("", {embed: {
title: "Erreur:",
color: 0xff0000,
description: " :no_entry_sign: Le salon textuel `admin-logs` n'existait pas, je viens de le créer pour vous :white_check_mark: , Veuillez réessayer :wink:",
footer: {
text: "Killer Diamond"
}
}}).catch(console.error);
}   
banMember.ban().then(member => {
    message.channel.sendMessage("", {embed: {
          title: "Succès :white_check_mark:",
          color: 0xff0000,
          description: `${member.user.username}`+` à bien été ban`,
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
}).then(message.guild.channels.find('name','admin-logs').sendMessage({
        embed: {
          type: 'rich',
          description: '',
          fields: [{
            name: '**L\'utilisateur <~>**',
            value: banMember.user.username,
            inline: true
          }, {
            name: 'User id',
            value: banMember.id,
            inline: true
          },{
            name: '**Action <~>**',
            value: "ban",
            inline: true
},{
            name: 'Modérateur',
            value: message.author.username,
            inline: true
}],
       
          color: 0xD30000,
          footer: {
            text: 'Moderation',
            proxy_icon_url: ' '
          },

          author: { 
            name: banMember.user.username + "#"+ banMember.user.discriminator,
            icon_url: " ",
            proxy_icon_url: ' '
          }
        }
})).catch(console.error);
	},
	'kick': (message) => {
let modRole = message.guild.roles.find("name", "Mod");
if(!message.member.roles.has(modRole.id)) {
  return message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :no_entry_sign: Vous n'avez pas la permissions d'utiliser cette commande ! :no_entry_sign: ",
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
      } 
    if(!message.guild.roles.exists("name", "Mod")) {
        return  message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :no_entry_sign: Le rôle **Mod** n'existe pas dans ce serveur veuillez le créer pour Kick! :no_entry_sign: ",
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
      } 
if(message.mentions.users.size === 0) {
  return message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :no_entry_sign: Merci de spécifié l'utilisateur que vous voulez Kick. **Format ~> `kd!kick @mention`** ! :no_entry_sign: ",
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
}
let kickMember = message.guild.member(message.mentions.users.first());
if(!kickMember) {
  return message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :x:  L\'utilisateur que vous avez entré n'est pas valide ! :x:",
          footer: {
            text: "Killer Diamond."
          }
        }}).catch(console.error);
}
if(!message.guild.member(client.user).hasPermission("KICK_MEMBERS")) {
  return message.reply("Je n'ai pas la permissions ** __(KICK_MEMBERS)__ **!").catch(console.error);
}
         if(!message.guild.channels.exists("name", "admin-logs")){
// créer le channel
message.guild.createChannel('admin-logs');
// Affiche un message d'erreur expliquant que le channel n'existait pas
return message.channel.sendMessage("", {embed: {
title: "Erreur:",
color: 0xff0000,
description: " :no_entry_sign: Le salon textuel `admin-logs` n'existait pas, je viens de le créer pour vous :white_check_mark: , Veuillez réessayer :wink:",
footer: {
text: "Killer Diamond"
}
}}).catch(console.error);
}   
kickMember.kick().then(member => {
    message.channel.sendMessage("", {embed: {
          title: "Succès :white_check_mark:",
          color: 0xff0000,
          description: `${member.user.username}`+` à bien été kick`,
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
}).then(message.guild.channels.find('name','admin-logs').sendMessage({
        embed: {
          type: 'rich',
          description: '',
          fields: [{
            name: '**L\'utilisateur <~>**',
            value: kickMember.user.username,
            inline: true
          }, {
            name: 'User id',
            value: kickMember.id,
            inline: true
          },{
            name: '**Action <~>**',
            value: "Kick",
            inline: true
},{
            name: 'Modérateur',
            value: message.author.username,
            inline: true
}],
       
          color: 0xD30000,
          footer: {
            text: 'Moderation',
            proxy_icon_url: ' '
          },

          author: { 
            name: kickMember.user.username + "#"+ kickMember.user.discriminator,
            icon_url: " ",
            proxy_icon_url: ' '
          }
        }
})).catch(console.error);
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
	'setgame': (msg) => {
	    if (msg.author.id !== "216926828802211842") return msg.channel.sendMessage(":no_entry_sign: Vous n'avez pas accès à cette commande ! :no_entry_sign:");
  	msg.channel.send("Setting updated : Setgame")
    client.user.setGame(`kd!help | ${client.guilds.size} serveurs | Beta`);
  	},
	'mute': (message) => {
let modRole = message.guild.roles.find("name", "Mod");
    if(!message.guild.roles.exists("name", "mute")) {
        return  message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :no_entry_sign: Le rôle **mute** n'existe pas dans ce serveur veuillez le créer pour Mute! :no_entry_sign: ",
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
      } 
      if(!message.member.roles.has(modRole.id)) {
        return message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :no_entry_sign: Vous n'avez pas la permissions d'utiliser cette commande ! :no_entry_sign: ",
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
      } 
      if(message.mentions.users.size === 0) {
        return message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :no_entry_sign: Merci de spécifié l'utilisateur que vous voulez mute totalment. **Format ~> `kd!mute @mention`** ! :no_entry_sign: ",
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
      }
      let muteMember = message.guild.member(message.mentions.users.first());
      if(!muteMember) {
        return message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :x:  L\'utilisateur que vous avez entré n'est pas valide ! :x:",
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
      }
      if(!message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
        return message.reply("Je n'ai pas la permissions pour faire cela __(MANAGE_MESSAGES)__ !").catch(console.error);
      }
         if(!message.guild.channels.exists("name", "admin-logs")){
// créer le channel
message.guild.createChannel('admin-logs');
// Affiche un message d'erreur expliquant que le channel n'existait pas
return message.channel.sendMessage("", {embed: {
title: "Erreur:",
color: 0xff0000,
description: " :no_entry_sign: Le salon textuel `admin-logs` n'existait pas, je viens de le créer pour vous :white_check_mark: , Veuillez réessayer :wink:",
footer: {
text: "Killer Diamond"
}
}}).catch(console.error);
}     
let mutedRole = message.guild.roles.find("name", "mute");
    var time = 500000;
    console.log(muteMember);
      muteMember.addRole(mutedRole).then(member => {
        message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :white_check_mark:  Vous avez bien mute ** "+ muteMember + " dans le serveur "+message.guild.name  + " ! :white_check_mark: ",
          footer: {
            text: "Killer Diamond"
          }
        }}).then(message.guild.channels.find('name','admin-logs').sendMessage({
        embed: {
          type: 'rich',
          description: '',
          fields: [{
            name: '**L\'utilisateur <~>**',
            value: muteMember.user.username,
            inline: true
          }, {
            name: 'User id',
            value: muteMember.id,
            inline: true
          },{
            name: '**Action <~>**',
            value: "mute total",
            inline: true
},{
            name: 'Modérateur',
            value: message.author.username,
            inline: true
}],
       
          color: 0xD30000,
          footer: {
            text: 'Moderation',
            proxy_icon_url: ' '
          },

          author: { 
            name: muteMember.user.username,
            icon_url: " ",
            proxy_icon_url: ' '
          }
	},
	'unmute': (message) => {
		 let modRole = message.guild.roles.find("name", "Mod");
            if(!message.guild.roles.exists("name", "Mod")) {
        return  message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :no_entry_sign: Le rôle **Mod** n'existe pas dans ce serveur veuillez le créer pour unmute! :no_entry_sign: ",
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
      }
    if(!message.guild.roles.exists("name", "mute")) {
        return  message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :no_entry_sign: Le rôle **mute** n'existe pas dans ce serveur veuillez le créer pour Unmute! :no_entry_sign: ",
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
      } 
      if(!message.member.roles.has(modRole.id)) {
        return message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :no_entry_sign: Vous n'avez pas la permissions d'utiliser cette commande ! :no_entry_sign: ",
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
      } 
      if(message.mentions.users.size === 0) {
        return message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :no_entry_sign: Merci de spécifié l'utilisateur que vous voulez unmute totalment. **Format ~> `!unmute @mention`** ! :no_entry_sign: ",
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
      }
      let muteMember = message.guild.member(message.mentions.users.first());
      if(!muteMember) {
        return message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :x:  L\'utilisateur que vous avez entré n'est pas valide ! :x:",
          footer: {
            text: "Killer Diamond"
          }
        }}).catch(console.error);
      }
      if(!message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) {
        return message.reply("Je n'ai pas la permissions pour faire cela __(MANAGE_MESSAGES)__ !").catch(console.error);
      }
         if(!message.guild.channels.exists("name", "admin-logs")){
// créer le channel
message.guild.createChannel('admin-logs');
// Affiche un message d'erreur expliquant que le channel n'existait pas
return message.channel.sendMessage("", {embed: {
title: "Erreur:",
color: 0xff0000,
description: " :no_entry_sign: Le salon textuel `admin-logs` n'existait pas, je viens de le créer pour vous :white_check_mark: , Veuillez réessayer :wink:",
footer: {
text: "Killer Diamond"
}
}}).catch(console.error);
}   
let mutedRole = message.guild.roles.find("name", "mute");
    var time = 500000;
    console.log(muteMember);
      muteMember.removeRole(mutedRole).then(member => {
        message.channel.sendMessage("", {embed: {
          title: "Erreur:",
          color: 0xff0000,
          description: " :white_check_mark:  Vous avez bien unmute ** "+ muteMember + " dans le serveur "+message.guild.name  + " ! :white_check_mark: ",
          footer: {
            text: "Killer Diamond"
          }
        }}).then(message.guild.channels.find('name','admin-logs').sendMessage({
        embed: {
          type: 'rich',
          description: '',
          fields: [{
            name: '**L\'utilisateur <~>**',
            value: muteMember.user.username,
            inline: true
          }, {
            name: 'User id',
            value: muteMember.id,
            inline: true
          },{
            name: '**Action <~>**',
            value: "unmute total",
            inline: true
},{
            name: 'Modérateur',
            value: message.author.username,
            inline: true
}],
       
          color: 0xD30000,
          footer: {
            text: 'Moderation',
            proxy_icon_url: ' '
          },

          author: { 
            name: muteMember.user.username,
            icon_url: " ",
            proxy_icon_url: ' '
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
