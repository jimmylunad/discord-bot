require('dotenv').config();

const { Client, MessageEmbed }             = require("discord.js");
const Koa                 = require('koa');
const { MessageHandler }  = require('discord-message-handler');

const moment              = require("moment-timezone");
moment().tz("America/Lima").format();

const client      = new Client();

// const musicSkipCmd = require('./commands/music_skip');

const settings = {
  prefix: '!',
  token: process.env.APP_TOKEN
};

const { Player } = require("discord-music-player");

const player = new Player(client, {
  leaveOnEmpty: false, // This options are optional.
});

client.player = player;

// client.player.play(VoiceChannel, SongName, Options, RequestedBy);

client.on('message', async (message) => {
  const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // !play This is the Life
  // will play "This is the Life" in the Voice Channel
  // !play https://open.spotify.com/track/5rX6C5QVvvZB7XckETNych?si=WlrC_VZVRlOhuv55V357AQ
  // will play "All Summer Long" in the Voice Channel

  if(command === 'play'){
      let song = await client.player.play(message.member.voice.channel, args.join(' '), {
          duration: 'long' // This is optional
      });
      song = song.song;
      message.channel.send(`Started playing ${song.name}.`);
  }

  if (command === 'playlist') {
    let isPlaying = client.player.isPlaying(message.guild.id);
    // If MaxSongs is -1, will be infinite.
    let playlist = await client.player.playlist(message.guild.id, args.join(' '), message.member.voice.channel, 10, message.author.tag);

    // Determine the Song (only if the music was not playing previously)
    let song = playlist.song;
    // Get the Playlist
    playlist = playlist.playlist;

    // Send information about adding the Playlist to the Queue
    message.channel.send(`Added a Playlist to the queue with **${playlist.videoCount} songs**, that was **made by ${playlist.channel}**.`)

    // If there was no songs previously playing, send a message about playing one.
    if (!isPlaying) {

        message.channel.send(`Started playing ${song.name}!`);

        // Send a message, when Queue would be empty.
        song.queue.on('end', () => {
            message.channel.send('The queue is empty, please add new songs!');
        }).on('songChanged', (oldSong, newSong, skipped, repeatMode, repeatQueue) => {
            if (repeatMode) {
                message.channel.send(`Playing ${newSong.name} again...`);
            } else if(repeatQueue) {
                message.channel.send(`Playing **${newSong.name}...**\nAdded **${oldSong.name}** to the end of the queue (repeatQueue).`);
            } else {
                message.channel.send(`Now playing ${newSong.name}...`);
            }
        }).on('songError', (errMessage, song) => {
            if(errMessage === 'VideoUnavailable')
                message.channel.send(`Could not play **${song.name}** - The song was Unavailable, skipping...`);
            else message.channel.send(`Could not play ${song.name} - ${errMessage}.`);
        });
    }

  }

  if(command === 'song'){
    let song = await client.player.nowPlaying(message.guild.id);
    message.channel.send(`Current song: ${song.name}`);
  }
});

client.on("ready", () => {
  console.log(`Bot ${client.user.tag} ha iniciado, con ${client.users.cache.size} usuarios, en ${client.channels.cache.size} canales de ${client.guilds.cache.size} servidores.`);
  console.log('Logged in as %s - %s\n', client.user.username, client.user.id);
  console.log('Estoy listo!');
});

client.on("guildMemberAdd", member => {
  const { user } = member;
  if (!user.bot) {
    let role = member.guild.roles.cache.get("809996921426149387");
    member.roles.add(role).catch(console.error);
  }
});

client.login(process.env.APP_TOKEN);