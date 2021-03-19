require('dotenv').config();
const ytdl = require('ytdl-core');
const queue = new Map();

module.exports = async function (msg, args) {
  if (msg.channel.id != process.env.MUSIC_CHANNEL_ID) {
    return;
  }

  const serverQueue = queue.get(msg.guild.id);
  if (args.length == 0) {
    msg.channel.send("Use `!music play yt-link` to play a song, you can skip the song and stop akbot with `!music skip/stop`");
  } else if (args[0] === "play") {
    execute(msg, serverQueue, args);
  } else if (args[0] === "skip") {
    skip(msg, serverQueue);
  } else if (args[0] === "stop") {
    stop(msg, serverQueue);
  }
}

async function execute(msg, serverQueue, args) {
  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };

  if (!serverQueue) {
    const voiceChannel = msg.member.voice.channel;
    const queueContruct = {
      textChannel: msg.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
     };
     // Setting the queue using our contract
     queue.set(msg.guild.id, queueContruct);
     // Pushing the song to our songs array
     queueContruct.songs.push(song);
     
     try {
      // Here we try to join the voicechat and save our connection into our object.
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      // Calling the play function to start a song
      play(msg.guild, queueContruct.songs[0]);
     } catch (err) {
      // Printing the error message if the bot fails to join the voicechat
      console.log(err);
      queue.delete(msg.guild.id);
      return msg.channel.send("You need to be in a voice chat!");
     }

  } else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    return msg.channel.send(`${song.title} has been added to the queue!`);
  }
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

function skip(msg, serverQueue) {
  if (!msg.member.voice.channel)
    return msg.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return msg.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(msg, serverQueue) {
  if (!msg.member.voice.channel)
    return msg.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  
  if (!serverQueue)
    return msg.channel.send("There is no song that I could stop!");
    
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

