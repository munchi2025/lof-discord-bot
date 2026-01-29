/**
 * LOF Discord Bot - Main Entry Point
 * Legion of Fools server setup and management bot
 */

require('dotenv').config();
const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');

// Import handlers
const { handleSetupCommand } = require('./handlers/serverSetup');
const { handleMemberVerification, handleVerificationApproval } = require('./handlers/memberVerify');
const { handleDiplomatRequest, handleDiplomatApproval } = require('./handlers/diplomatVerify');
const { handleActionCommand } = require('./handlers/actionCommands');

// Parse allowed guilds from environment
const ALLOWED_GUILDS = process.env.ALLOWED_GUILDS
  ? process.env.ALLOWED_GUILDS.split(',').map((id) => id.trim())
  : [];

// Create client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Store for pending verifications (in production, use a database)
client.pendingVerifications = new Collection();
client.pendingDiplomats = new Collection();

// Bot ready event
client.once(Events.ClientReady, (readyClient) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   ⚔️ LEGION OF FOOLS BOT ⚔️');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Logged in as ${readyClient.user.tag}`);
  console.log(`📊 Serving ${readyClient.guilds.cache.size} server(s)`);
  if (ALLOWED_GUILDS.length > 0) {
    console.log(`🔒 Guild lock enabled: ${ALLOWED_GUILDS.length} allowed server(s)`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Auto-leave unauthorized servers
  if (ALLOWED_GUILDS.length > 0) {
    readyClient.guilds.cache.forEach((guild) => {
      if (!ALLOWED_GUILDS.includes(guild.id)) {
        console.log(`🚫 Leaving unauthorized server: ${guild.name} (${guild.id})`);
        guild.leave().catch(console.error);
      }
    });
  }
});

// Auto-leave when added to unauthorized server
client.on(Events.GuildCreate, (guild) => {
  if (ALLOWED_GUILDS.length > 0 && !ALLOWED_GUILDS.includes(guild.id)) {
    console.log(`🚫 Added to unauthorized server, leaving: ${guild.name} (${guild.id})`);
    guild.leave().catch(console.error);
  } else {
    console.log(`✅ Joined authorized server: ${guild.name} (${guild.id})`);
  }
});

// Slash command handler
client.on(Events.InteractionCreate, async (interaction) => {
  // Guild lock - only allow interactions from allowed servers
  if (ALLOWED_GUILDS.length > 0 && !ALLOWED_GUILDS.includes(interaction.guild?.id)) {
    if (interaction.isRepliable()) {
      return interaction.reply({
        content: '❌ This bot is not authorized for this server.',
        ephemeral: true,
      });
    }
    return;
  }

  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'setup') {
      await handleSetupCommand(interaction);
    }
  }

  // Handle button clicks
  if (interaction.isButton()) {
    const customId = interaction.customId;

    // Setup confirmation buttons
    if (customId === 'setup_confirm') {
      await handleSetupConfirm(interaction);
    } else if (customId === 'setup_cancel') {
      await interaction.update({
        content: '❌ Server setup cancelled.',
        embeds: [],
        components: [],
      });
    }

    // Member verification button
    else if (customId === 'verify_member') {
      await handleMemberVerification(interaction);
    }

    // Verification approval buttons
    else if (customId.startsWith('approve_member_')) {
      await handleVerificationApproval(interaction, true);
    } else if (customId.startsWith('deny_member_')) {
      await handleVerificationApproval(interaction, false);
    }

    // Diplomat request button
    else if (customId === 'request_diplomat') {
      await handleDiplomatRequest(interaction);
    }

    // Diplomat approval buttons
    else if (customId.startsWith('approve_diplomat_')) {
      await handleDiplomatApproval(interaction, true);
    } else if (customId.startsWith('deny_diplomat_')) {
      await handleDiplomatApproval(interaction, false);
    }
  }

  // Handle modal submissions
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'verify_ign_modal') {
      await handleIGNSubmission(interaction);
    } else if (interaction.customId === 'diplomat_request_modal') {
      await handleDiplomatSubmission(interaction);
    }
  }
});

// Message handler for OwO action commands
client.on(Events.MessageCreate, async (message) => {
  // Ignore DMs
  if (!message.guild) return;

  // Guild lock check
  if (ALLOWED_GUILDS.length > 0 && !ALLOWED_GUILDS.includes(message.guild.id)) {
    return;
  }

  // Handle action commands (owo slap @user, etc.)
  await handleActionCommand(message);
});

/**
 * Handle diplomat modal submission
 */
async function handleDiplomatSubmission(interaction) {
  const { processDiplomatSubmission } = require('./handlers/diplomatVerify');
  await processDiplomatSubmission(interaction);
}

/**
 * Handle setup confirmation button
 */
async function handleSetupConfirm(interaction) {
  const { executeServerSetup } = require('./handlers/serverSetup');
  await executeServerSetup(interaction);
}

/**
 * Handle IGN modal submission
 */
async function handleIGNSubmission(interaction) {
  const { processIGNSubmission } = require('./handlers/memberVerify');
  await processIGNSubmission(interaction);
}

// Error handling
client.on(Events.Error, (error) => {
  console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

// Login
if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN not found in .env file');
  console.log('📋 Please copy .env.example to .env and fill in your bot token');
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
