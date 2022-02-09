const { SlashCommandBuilder } = require("@discordjs/builders");
const { resume } = require('./music')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume a music.'),
  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel

    if (!voiceChannel) return await interaction.reply('You need to be in voice channel to execute command.')
    await resume(interaction)
  }
}