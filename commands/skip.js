const { SlashCommandBuilder } = require("@discordjs/builders");
const { skip } = require('./music')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip a music.'),
  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel

    if (!voiceChannel) return await interaction.reply('You need to be in voice channel to execute command.')
    skip(interaction)
  }
}