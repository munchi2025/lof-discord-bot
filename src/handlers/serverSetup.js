/**
 * Server Setup Handler
 * Handles the /setup command and creates all roles, channels, and permissions
 */

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require('discord.js');

const { roles: roleConfigs } = require('../config/roles');
const { categories: categoryConfigs } = require('../config/channels');
const { checkBotPermissions, SETUP_PERMISSIONS, formatMissingPermissions } = require('../utils/permissions');

/**
 * Handle /setup command - show confirmation
 */
async function handleSetupCommand(interaction) {
  // Check if OWNER_ID is set and if user is the owner
  const ownerId = process.env.OWNER_ID;
  if (ownerId && interaction.user.id !== ownerId) {
    return interaction.reply({
      content: '❌ Only the bot owner can use this command.',
      ephemeral: true,
    });
  }

  // Check if user has admin permissions
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: '❌ You need Administrator permissions to use this command.',
      ephemeral: true,
    });
  }

  // Check bot permissions
  const permCheck = checkBotPermissions(interaction.guild, SETUP_PERMISSIONS);
  if (!permCheck.hasAll) {
    return interaction.reply({
      content: `❌ Bot is missing required permissions:\n${formatMissingPermissions(permCheck.missing)}\n\nPlease give the bot Administrator permission or the specific permissions listed above.`,
      ephemeral: true,
    });
  }

  // Count existing channels and roles
  const channelCount = interaction.guild.channels.cache.size;
  const roleCount = interaction.guild.roles.cache.size - 1; // Exclude @everyone

  // Create confirmation embed
  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('⚔️ LOF Server Setup')
    .setDescription('This will set up your server with the Legion of Fools structure.')
    .addFields(
      {
        name: '📊 Current Server Status',
        value: `• ${channelCount} channels\n• ${roleCount} roles (excluding @everyone)`,
      },
      {
        name: '⚠️ Warning',
        value: 'This will **DELETE ALL existing channels and roles** (except @everyone and bot roles) and create the LOF structure.',
      },
      {
        name: '📋 What will be created',
        value: '• 4 roles (R5, R4, Diplomat, Member)\n• 8 categories\n• 19 text channels\n• 4 voice channels\n• Verification system\n• Welcome messages',
      }
    )
    .setFooter({ text: 'This action cannot be undone!' });

  // Create buttons
  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('setup_confirm')
      .setLabel('Yes, Reset & Setup')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('⚠️'),
    new ButtonBuilder()
      .setCustomId('setup_cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.reply({
    embeds: [embed],
    components: [buttons],
    ephemeral: true,
  });
}

/**
 * Execute the server setup after confirmation
 */
async function executeServerSetup(interaction) {
  await interaction.update({
    content: '🔄 Starting server setup... This may take a moment.',
    embeds: [],
    components: [],
  });

  const guild = interaction.guild;
  const statusMessages = [];

  try {
    // Step 0: Rename the server
    statusMessages.push('📛 Renaming server...');
    await updateStatus(interaction, statusMessages);
    await guild.setName('⚔️ Legion of Fools ⚔️');
    statusMessages[statusMessages.length - 1] = '✅ Server renamed to "⚔️ Legion of Fools ⚔️"';

    // Step 1: Delete existing channels (except the one we're using)
    statusMessages.push('🗑️ Deleting existing channels...');
    await updateStatus(interaction, statusMessages);
    await deleteAllChannels(guild);
    statusMessages[statusMessages.length - 1] = '✅ Deleted existing channels';

    // Step 2: Delete existing roles (except @everyone and bot roles)
    statusMessages.push('🗑️ Deleting existing roles...');
    await updateStatus(interaction, statusMessages);
    await deleteAllRoles(guild);
    statusMessages[statusMessages.length - 1] = '✅ Deleted existing roles';

    // Step 3: Create roles
    statusMessages.push('🎭 Creating roles...');
    await updateStatus(interaction, statusMessages);
    const createdRoles = await createRoles(guild);
    statusMessages[statusMessages.length - 1] = `✅ Created ${Object.keys(createdRoles).length} roles`;

    // Step 4: Create categories and channels
    statusMessages.push('📁 Creating channels...');
    await updateStatus(interaction, statusMessages);
    const channelStats = await createCategoriesAndChannels(guild, createdRoles);
    statusMessages[statusMessages.length - 1] = `✅ Created ${channelStats.categories} categories, ${channelStats.channels} channels`;

    // Step 5: Send welcome and verification messages
    statusMessages.push('📝 Setting up welcome messages...');
    await updateStatus(interaction, statusMessages);
    await setupWelcomeMessages(guild, createdRoles, channelStats.createdChannels);
    statusMessages[statusMessages.length - 1] = '✅ Welcome messages sent';

    // Step 6: Configure onboarding
    statusMessages.push('🚪 Configuring onboarding...');
    await updateStatus(interaction, statusMessages);
    await setupOnboarding(guild, createdRoles, channelStats.createdChannels);
    statusMessages[statusMessages.length - 1] = '✅ Onboarding configured';

    // Final success message
    const successEmbed = new EmbedBuilder()
      .setColor(0x50C878)
      .setTitle('✅ Server Setup Complete!')
      .setDescription('Your LOF server structure has been created successfully.')
      .addFields(
        {
          name: '📊 Created',
          value: statusMessages.join('\n'),
        },
        {
          name: '📋 Next Steps',
          value: '1. Assign yourself the R5 - Leader role\n2. Customize #📕-rules with your alliance rules\n3. Update #🛡️-alliance-info with NAP/ally info\n4. Enable Community Server for onboarding popup\n5. Invite your members!',
        }
      );

    await interaction.editReply({
      content: null,
      embeds: [successEmbed],
    });

  } catch (error) {
    console.error('Setup error:', error);

    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('❌ Setup Failed')
      .setDescription(`An error occurred during setup:\n\`\`\`${error.message}\`\`\``)
      .addFields({
        name: 'Progress',
        value: statusMessages.join('\n') || 'No progress made',
      });

    await interaction.editReply({
      content: null,
      embeds: [errorEmbed],
    });
  }
}

/**
 * Update status message
 */
async function updateStatus(interaction, messages) {
  try {
    await interaction.editReply({
      content: messages.join('\n'),
    });
  } catch (error) {
    // Ignore update errors
  }
}

/**
 * Delete all channels in the guild
 */
async function deleteAllChannels(guild) {
  const channels = guild.channels.cache;

  for (const [id, channel] of channels) {
    try {
      await channel.delete('LOF Server Setup');
      await delay(100); // Rate limit protection
    } catch (error) {
      console.log(`Could not delete channel ${channel.name}:`, error.message);
    }
  }
}

/**
 * Delete all custom roles in the guild
 */
async function deleteAllRoles(guild) {
  // Fetch fresh roles to ensure we have the latest
  await guild.roles.fetch();

  const roles = guild.roles.cache;
  const botMember = guild.members.me;
  const botHighestRole = botMember?.roles.highest;

  // Sort roles by position (lowest first) to avoid hierarchy issues
  const sortedRoles = [...roles.values()].sort((a, b) => a.position - b.position);

  for (const role of sortedRoles) {
    // Skip @everyone
    if (role.id === guild.id) continue;

    // Skip managed roles (bot/integration roles)
    if (role.managed) {
      console.log(`Skipping managed role: ${role.name}`);
      continue;
    }

    // Skip roles at or above bot's highest role
    if (botHighestRole && role.position >= botHighestRole.position) {
      console.log(`Skipping role above bot: ${role.name}`);
      continue;
    }

    try {
      console.log(`Deleting role: ${role.name}`);
      await role.delete('LOF Server Setup');
      await delay(150);
    } catch (error) {
      console.log(`Could not delete role ${role.name}:`, error.message);
    }
  }
}

/**
 * Create all roles
 * @returns {Object} - Map of role names to role objects
 */
async function createRoles(guild) {
  const createdRoles = {};
  const botHighestRole = guild.members.me?.roles.highest;

  // Calculate starting position (just below bot's role)
  const startPosition = botHighestRole ? botHighestRole.position - 1 : 1;

  // Create roles in order (Member, Diplomat, R4, R5)
  // We'll set positions after all are created
  for (const roleConfig of roleConfigs) {
    try {
      const role = await guild.roles.create({
        name: roleConfig.name,
        color: roleConfig.color,
        permissions: roleConfig.permissions,
        hoist: roleConfig.hoist,
        mentionable: roleConfig.mentionable,
        reason: 'LOF Server Setup',
      });

      // Store with simplified key
      const key = roleConfig.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      createdRoles[key] = role;

      await delay(100);
    } catch (error) {
      console.error(`Failed to create role ${roleConfig.name}:`, error.message);
    }
  }

  // Now set positions - R5 highest, then R4, Diplomat, Member lowest
  // Position array: higher position = higher in list
  const roleOrder = [
    { role: createdRoles['r5leader'], offset: 0 },      // Highest (just below bot)
    { role: createdRoles['r4officer'], offset: 1 },     // Second
    { role: createdRoles['diplomat'], offset: 2 },      // Third
    { role: createdRoles['member'], offset: 3 },        // Fourth (lowest of our roles)
  ];

  try {
    const positionUpdates = roleOrder
      .filter(item => item.role)
      .map(item => ({
        role: item.role.id,
        position: Math.max(1, startPosition - item.offset),
      }));

    if (positionUpdates.length > 0) {
      await guild.roles.setPositions(positionUpdates);
      console.log('Role positions set successfully');
    }
  } catch (error) {
    console.error('Failed to set role positions:', error.message);
  }

  // Create lookup with friendly keys
  return {
    member: createdRoles['member'],
    diplomat: createdRoles['diplomat'],
    r4: createdRoles['r4officer'],
    r5: createdRoles['r5leader'],
  };
}

/**
 * Create all categories and channels
 */
async function createCategoriesAndChannels(guild, roles) {
  let categoryCount = 0;
  let channelCount = 0;
  const createdChannels = {};

  for (const categoryConfig of categoryConfigs) {
    try {
      // Create category
      const category = await guild.channels.create({
        name: categoryConfig.name,
        type: 4, // Category
        reason: 'LOF Server Setup',
      });
      categoryCount++;
      await delay(100);

      // Create channels in this category
      for (const channelConfig of categoryConfig.channels) {
        try {
          const permissionOverwrites = channelConfig.getPermissions
            ? channelConfig.getPermissions(roles, guild.id)
            : [];

          const channel = await guild.channels.create({
            name: channelConfig.name,
            type: channelConfig.type,
            parent: category.id,
            topic: channelConfig.topic || null,
            permissionOverwrites,
            reason: 'LOF Server Setup',
          });

          // Store channel reference by name for later use
          createdChannels[channelConfig.name] = channel;

          channelCount++;
          await delay(100);
        } catch (error) {
          console.error(`Failed to create channel ${channelConfig.name}:`, error.message);
        }
      }
    } catch (error) {
      console.error(`Failed to create category ${categoryConfig.name}:`, error.message);
    }
  }

  return { categories: categoryCount, channels: channelCount, createdChannels };
}

/**
 * Set up welcome and verification messages
 */
async function setupWelcomeMessages(guild, roles, createdChannels) {
  // Use createdChannels directly instead of searching the cache
  const welcomeChannel = createdChannels['🚪-welcome'];
  const rulesChannel = createdChannels['📕-rules'];
  const verifyChannel = createdChannels['✨-verify-member'];
  const diplomatChannel = createdChannels['🤝-diplomat-request'];

  if (welcomeChannel) {
    const welcomeEmbed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('⚔️ LEGION OF FOOLS ⚔️')
      .setDescription('**[ LOF ]**\n\nWelcome, warrior! You\'ve joined one of Dark War Survival\'s finest alliances.')
      .addFields(
        {
          name: '🛡️ What We Stand For',
          value: '• Unity in battle\n• Respect for all members\n• Strategic excellence\n• Having fun together',
        },
        {
          name: '📋 Getting Started',
          value: `1. Read the <#${rulesChannel?.id || 'rules'}>\n2. Go to <#${verifyChannel?.id || 'verify'}> and click **Verify**\n3. Enter your **In-Game Name (IGN)**\n4. Wait for an R4+ to approve you\n5. Join the fun in general chat!`,
        },
        {
          name: '⚔️ Stay Battle-Ready',
          value: '• Watch war announcements for rally alerts\n• Check strategy channel for tips',
        },
        {
          name: '🤖 Bots & Fun',
          value: '• Use bot-commands channel for music, memes, and more!',
        }
      )
      .setFooter({ text: 'Questions? Ask in the ask-questions channel!' });

    await welcomeChannel.send({ embeds: [welcomeEmbed] });
  }

  if (verifyChannel) {
    const verifyEmbed = new EmbedBuilder()
      .setColor(0x50C878)
      .setTitle('✨ MEMBER VERIFICATION')
      .setDescription('Welcome to Legion of Fools!\n\nTo get access to LOF channels:')
      .addFields(
        {
          name: 'Steps',
          value: '1. Click the **Verify** button below\n2. Enter your **In-Game Name (IGN)** in the popup\n3. Wait for an R4+ officer to approve you\n4. Once approved:\n   • Your server nickname will be set to your IGN\n   • You\'ll gain access to all member channels',
        },
        {
          name: '⚠️ Note',
          value: 'You cannot change your nickname after verification.\nOnly R4+ officers can modify nicknames.',
        }
      );

    const verifyButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_member')
        .setLabel('Verify')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🛡️')
    );

    await verifyChannel.send({ embeds: [verifyEmbed], components: [verifyButton] });
  }

  if (diplomatChannel) {
    const diplomatEmbed = new EmbedBuilder()
      .setColor(0x7B68EE)
      .setTitle('🤝 DIPLOMAT ACCESS REQUEST')
      .setDescription('Are you a diplomat from another alliance?')
      .addFields(
        {
          name: 'Request Access',
          value: 'Click the button below to request diplomat access.\nAn R4+ officer will review your request.',
        },
        {
          name: '⚠️ Note',
          value: 'This is for diplomats from other alliances only.\nIf you\'re a LOF member, use the member verification instead.',
        }
      );

    const diplomatButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('request_diplomat')
        .setLabel('Request Diplomat Access')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🌐')
    );

    await diplomatChannel.send({ embeds: [diplomatEmbed], components: [diplomatButton] });
  }

  if (rulesChannel) {
    const rulesEmbed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('📕 ALLIANCE RULES')
      .setDescription('*[Edit this message to add your alliance rules]*')
      .addFields(
        {
          name: '1. Respect',
          value: 'Treat all members with respect.',
        },
        {
          name: '2. Activity',
          value: 'Stay active and participate in alliance events.',
        },
        {
          name: '3. Communication',
          value: 'Communicate clearly and follow leadership instructions.',
        },
        {
          name: '4. NAP/Allies',
          value: 'Do not attack NAP or allied alliances.',
        }
      )
      .setFooter({ text: 'R4+ can edit this message with actual alliance rules' });

    await rulesChannel.send({ embeds: [rulesEmbed] });
  }
}

/**
 * Set up Discord onboarding for new members
 */
async function setupOnboarding(guild, roles, createdChannels) {
  try {
    const welcomeChannel = createdChannels['🚪-welcome'];
    const rulesChannel = createdChannels['📕-rules'];
    const verifyChannel = createdChannels['✨-verify-member'];
    const generalChannel = createdChannels['💬-general-chat'];

    // Build default channel IDs (channels shown to new members)
    const defaultChannelIds = [];
    if (welcomeChannel) defaultChannelIds.push(welcomeChannel.id);
    if (rulesChannel) defaultChannelIds.push(rulesChannel.id);
    if (verifyChannel) defaultChannelIds.push(verifyChannel.id);

    // Configure onboarding
    await guild.editOnboarding({
      enabled: true,
      defaultChannelIds: defaultChannelIds,
      mode: 0, // Default mode - onboarding prompts are optional
      prompts: [
        {
          title: 'What brings you to Legion of Fools?',
          singleSelect: true,
          required: false,
          inOnboarding: true,
          options: [
            {
              title: 'LOF Member',
              description: 'I\'m a current member of the LOF alliance in-game',
              channelIds: verifyChannel ? [verifyChannel.id] : [],
              roleIds: [],
            },
            {
              title: 'Diplomat',
              description: 'I\'m a diplomat from another alliance',
              channelIds: [],
              roleIds: [],
            },
            {
              title: 'Just Looking',
              description: 'I\'m just checking out the server',
              channelIds: welcomeChannel ? [welcomeChannel.id] : [],
              roleIds: [],
            },
          ],
        },
      ],
    });

    console.log('Onboarding configured successfully');
  } catch (error) {
    // Onboarding may fail if the guild doesn't meet requirements (needs Community enabled)
    console.error('Failed to configure onboarding:', error.message);
    console.log('Note: Onboarding requires Community Server features to be enabled');
  }
}

/**
 * Delay helper for rate limiting
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  handleSetupCommand,
  executeServerSetup,
};
