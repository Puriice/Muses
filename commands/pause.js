const { SlashCommandBuilder } = require("@discordjs/builders");
const { pause } = require('./music')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause a music.'),
  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel

    if (!voiceChannel) return await interaction.reply('You need to be in voice channel to execute command.')
    await pause(interaction)
  }
}