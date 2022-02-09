const { SlashCommandBuilder } = require("@discordjs/builders");
const { disconnect } = require('./music')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('Disconnect a music bot.'),
  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel

    if (!voiceChannel) return await interaction.reply('You need to be in voice channel to execute command.')
    disconnect(interaction)
  }
}