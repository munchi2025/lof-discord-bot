/**
 * Action Commands Handler
 * Handles OwO-style action commands with GIFs
 */

const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const {
  isValidAction,
  getRandomGif,
  getRandomMessage,
  getActionColor,
  getAllActions,
} = require('../config/actions');
const fs = require('fs');

// Command prefix
const PREFIX = 'owo';

// Action emojis for visual flair
const ACTION_EMOJIS = {
  // Gaming
  score: '🎯', gg: '🤝', rekt: '💀', carry: '🦸', clutch: '⚡',
  teabag: '🫖', rage: '😤', noob: '👶', camp: '⛺', combo: '🔥',
  // Affection
  hug: '🤗', pat: '✋', cuddle: '💕', poke: '👉', boop: '👆',
  wave: '👋', highfive: '🙌', handhold: '💑', snuggle: '🥰', glomp: '💨',
  // Aggressive
  slap: '👋', punch: '👊', kick: '🦵', bonk: '🔨', smack: '💥',
  bite: '😬', yeet: '🚀', throw: '💨', stab: '🗡️', shoot: '🔫',
  // Bratty
  spank: '🍑', ballkick: '⚽', wedgie: '🩲', bully: '😈', tease: '😏',
  lick: '👅', grope: '🙈', choke: '😵', sit: '🪑', trap: '🪤',
  // Meme
  cringe: '😬', stare: '👀', judge: '🧐', shame: '🔔', flex: '💪',
  mock: '🤪', facepalm: '🤦', disappoint: '😞',
};

/**
 * Parse a message for action commands
 * @param {Message} message - Discord message
 * @returns {Object|null} - Parsed command or null
 */
function parseActionCommand(message) {
  const content = message.content.toLowerCase().trim();

  // Check if message starts with prefix
  if (!content.startsWith(PREFIX)) return null;

  // Remove prefix and split into parts
  const withoutPrefix = message.content.slice(PREFIX.length).trim();
  const parts = withoutPrefix.split(/\s+/);

  if (parts.length < 1) return null;

  const action = parts[0].toLowerCase();

  // Get mentioned user
  const mentionedUser = message.mentions.users.first();

  return {
    action,
    mentionedUser,
    rawArgs: parts.slice(1).join(' '),
  };
}

/**
 * Handle an action command
 * @param {Message} message - Discord message
 */
async function handleActionCommand(message) {
  // Don't respond to bots
  if (message.author.bot) return;

  // Parse the command
  const parsed = parseActionCommand(message);
  if (!parsed) return;

  const { action, mentionedUser } = parsed;

  // Check if action is "help" or "actions"
  if (action === 'help' || action === 'actions') {
    return sendActionHelp(message);
  }

  // Check if it's a valid action
  if (!isValidAction(action)) {
    // Silently ignore invalid actions (might be other bot commands)
    return;
  }

  // Require a mentioned user (no self-target)
  if (!mentionedUser) {
    return message.reply({
      content: `You need to mention someone! Usage: \`${PREFIX} ${action} @user\``,
      allowedMentions: { repliedUser: false },
    });
  }

  // Don't allow self-targeting
  if (mentionedUser.id === message.author.id) {
    return message.reply({
      content: `You can't ${action} yourself! Mention someone else.`,
      allowedMentions: { repliedUser: false },
    });
  }

  // Get random GIF
  const gifPath = getRandomGif(action);

  // Get random message
  const actionMessage = getRandomMessage(
    action,
    `**${message.author.displayName || message.author.username}**`,
    `**${mentionedUser.displayName || mentionedUser.username}**`
  );

  // Get emoji for action
  const emoji = ACTION_EMOJIS[action] || '✨';
  const actionTitle = action.charAt(0).toUpperCase() + action.slice(1);

  // Build visually pleasing embed
  const embed = new EmbedBuilder()
    .setColor(getActionColor(action))
    .setAuthor({
      name: `${emoji} ${actionTitle}!`,
      iconURL: message.author.displayAvatarURL({ dynamic: true })
    })
    .setDescription(`\n${actionMessage}\n`);

  // Prepare message options
  const messageOptions = {
    embeds: [embed],
  };

  // If we have a local GIF, attach it
  if (gifPath && fs.existsSync(gifPath)) {
    const attachment = new AttachmentBuilder(gifPath, { name: `${action}.gif` });
    embed.setImage(`attachment://${action}.gif`);
    messageOptions.files = [attachment];
  }

  // Add subtle footer
  embed.setFooter({
    text: `${PREFIX} ${action} @user`,
    iconURL: mentionedUser.displayAvatarURL({ dynamic: true })
  });
  embed.setTimestamp();

  // Send the action
  try {
    await message.channel.send(messageOptions);
  } catch (error) {
    console.error(`Error sending action command:`, error);
  }
}

/**
 * Send help message with all available actions
 * @param {Message} message - Discord message
 */
async function sendActionHelp(message) {
  const allActions = getAllActions();

  // Group actions by category
  const categories = {
    gaming: [],
    affection: [],
    aggressive: [],
    bratty: [],
    meme: [],
  };

  const { actions: actionConfigs } = require('../config/actions');
  for (const [name, config] of Object.entries(actionConfigs)) {
    if (categories[config.category]) {
      categories[config.category].push(name);
    }
  }

  // Format actions in clean columns (5 per row)
  const formatActions = (actions) => {
    if (actions.length === 0) return '*None*';
    const rows = [];
    for (let i = 0; i < actions.length; i += 5) {
      const row = actions.slice(i, i + 5).map(a => `\`${a}\``).join(' · ');
      rows.push(row);
    }
    return rows.join('\n');
  };

  const embed = new EmbedBuilder()
    .setColor(0xFF69B4)
    .setTitle('✨ Action Commands')
    .setDescription(
      `**How to use:** \`${PREFIX} <action> @user\`\n` +
      `**Example:** \`${PREFIX} slap @someone\`\n` +
      `━━━━━━━━━━━━━━━━━━━━━━`
    )
    .addFields(
      {
        name: '🎮 Gaming',
        value: formatActions(categories.gaming),
        inline: false,
      },
      {
        name: '💕 Affection',
        value: formatActions(categories.affection),
        inline: false,
      },
      {
        name: '👊 Aggressive',
        value: formatActions(categories.aggressive),
        inline: false,
      },
      {
        name: '😈 Bratty',
        value: formatActions(categories.bratty),
        inline: false,
      },
      {
        name: '🎭 Meme',
        value: formatActions(categories.meme),
        inline: false,
      }
    )
    .setFooter({ text: `${allActions.length} actions · ${PREFIX} help` });

  await message.reply({
    embeds: [embed],
    allowedMentions: { repliedUser: false },
  });
}

module.exports = {
  handleActionCommand,
  PREFIX,
};
