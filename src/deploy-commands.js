/**
 * Deploy slash commands to Discord
 * Run this once after adding new commands: npm run deploy
 */

require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

// Define commands
const commands = [
  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Set up the LOF server structure (channels, roles, permissions)')
    .setDefaultMemberPermissions(0) // Restrict to administrators
    .toJSON(),
];

// Deploy commands
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🚀 Started refreshing application (/) commands...');

    // Deploy to specific guild (faster, for development)
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log(`✅ Successfully registered commands to guild ${process.env.GUILD_ID}`);
    } else {
      // Deploy globally (takes up to 1 hour to propagate)
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commands,
      });
      console.log('✅ Successfully registered global commands');
    }
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();
