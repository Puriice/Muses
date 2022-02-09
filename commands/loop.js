const { SlashCommandBuilder } = require("@discordjs/builders");
const { loop } = require('./music')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Loop a music bot.'),
  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel

    if (!voiceChannel) return await interaction.reply('You need to be in voice channel to execute command.')

    const isLoop = await loop(interaction.guildId)

    if (isLoop === 1)
      await interaction.reply("Music looped :thumbsup:")
    else if (isLoop === 0)
      await interaction.reply("Music unlooped :thumbsup:")
    else if (isLoop === -1)
      await interaction.reply("There is no song in the queue :cry:")
    else
      await interaction.reply("There is an error to execute command.")
  }
}