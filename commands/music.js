const { getVoiceConnection, AudioPlayerStatus, joinVoiceChannel, AudioPlayer, createAudioResource, VoiceConnectionStatus } = require('@discordjs/voice')
const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core')
const ytSearch = require('yt-search')

const queue = new Map()

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play the music.')
    .addStringOption(option => option
      .setName('song')
      .setDescription('Type keywords or url to search.')
      .setRequired(true)
    )
  ,
  async execute(interaction) {
    if (!interaction.guild) return await interaction.reply(`DM command ca't be use.`)
    const voiceChannel = interaction.member.voice.channel

    if (!voiceChannel) return await interaction.reply('You need to be in voice channel to execute command.')

    const args = interaction.options.getString('song')

    const serverQueue = queue.get(interaction.guildId)

    let song = {}

    if (ytdl.validateURL(args)) {
      const musicInfo = await ytdl.getInfo(args)
      song = {
        title: musicInfo.videoDetails.title,
        url: musicInfo.videoDetails.video_url,
        requester: interaction.member.displayName,
        loop: false
      }
    } else {
      const video = (await ytSearch(args)).videos[0] ?? null

      if (video)
        song = {
          title: video.title,
          url: video.url,
          requester: interaction.member.displayName,
          loop: false
        }
      else
        return await interaction.reply('Not found :cry:')
    }

    if (!serverQueue) {
      try {
        const connection = new joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
          selfDeaf: true
        })

        connection.on(VoiceConnectionStatus.Disconnected, () => {
          const songQueue = queue.get(interaction.guildId)
          songQueue.timeout = setTimeout(() => {
            const connection = getVoiceConnection(interaction.guildId)
            connection.destroy();
          }, 1000);
        })
        connection.on(VoiceConnectionStatus.Destroyed, () => {
          queue.delete(interaction.guildId)
        })
        connection.on(VoiceConnectionStatus.Ready, () => {
          const songQueue = queue.get(interaction.guildId)
          if (songQueue.timeout) {
            clearTimeout(songQueue.timeout)
          }
        })

        const player = new AudioPlayer()

        player.on(AudioPlayerStatus.Idle, () => {
          const songQueue = queue.get(interaction.guildId)
          if (!songQueue.songs[0]?.loop) {
            songQueue.songs.shift()
          }
          play(interaction.guildId, songQueue.songs[0])
        })

        connection.subscribe(player)

        const newQueue = {
          voiceChannel,
          textChannel: interaction.channel,
          player,
          songs: []
        }

        queue.set(interaction.guildId, newQueue);
        newQueue.songs.push(song)


        play(interaction.guildId, newQueue.songs[0])
      } catch (error) {
        queue.delete(interaction.guildId)
        return await interaction.reply('There is an error on connection.')
        console.log(error);
      }
    } else {
      serverQueue.songs.push(song)
      return await interaction.reply(`**${song.title}** was added to the list :thumbsup:`)
    }
    await interaction.reply(':call_me:')
  },
  disconnect,
  skip,
  loop,
  pause,
  resume
}

async function play(guildId, song) {
  const songQueue = queue.get(guildId)

  if (!song) {
    try {
      getVoiceConnection(guildId).destroy();
    } catch (error) {
      throw error;
    }
    return;
  }

  const stream = ytdl(song.url, { filter: 'audioonly' })
  const resource = new createAudioResource(stream);

  try {
    songQueue.player.play(resource)
  } catch (error) {
    console.log(error);
    throw error;
  }
  await songQueue.textChannel.send(`Now playing :musical_note:**${song.title}**:notes: \nRequested by ${song.requester}`)
}

async function disconnect(interaction) {
  const songQueue = queue.get(interaction.guildId)
  if (!songQueue) return await interaction.reply('Bot isn\'t in a voice channel. :sweat:')
  songQueue.songs = []
  songQueue.player.stop()
  await interaction.reply("Bot leaved :thumbsup:")
}
async function skip(interaction) {
  const songQueue = queue.get(interaction.guildId)
  if (!songQueue) return await interaction.reply('There is no song in the queue!')
  songQueue.player.stop()
  return await interaction.reply("Music Skipped :thumbsup:")
}
async function loop(guildId) {
  const songQueue = queue.get(guildId)

  if (!songQueue?.songs?.length || !songQueue) return -1;

  songQueue.songs[0].loop = !songQueue.songs[0].loop

  return (songQueue.songs[0].loop) ? 1 : 0
}
async function pause(interaction) {
  const songQueue = queue.get(interaction.guildId)
  if (!songQueue) return await interaction.reply('Bot isn\'t in a voice channel. :sweat:')
  songQueue.player.pause()
  await interaction.reply('Music paused :thumbsup:')
}
async function resume(interaction) {
  const songQueue = queue.get(interaction.guildId)
  if (!songQueue) return await interaction.reply('Bot isn\'t in a voice channel. :sweat:')
  songQueue.player.unpause()
  await interaction.reply('Music resumed :thumbsup:')
}