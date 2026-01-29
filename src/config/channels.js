const { ChannelType, PermissionFlagsBits } = require('discord.js');

/**
 * Channel structure for LOF Discord server
 * Categories and their channels are defined with permission overwrites
 */

// Permission presets for easy reuse
const DENY_ALL = {
  ViewChannel: false,
  SendMessages: false,
};

const VIEW_ONLY = {
  ViewChannel: true,
  SendMessages: false,
  AddReactions: false,
};

const FULL_ACCESS = {
  ViewChannel: true,
  SendMessages: true,
  ReadMessageHistory: true,
  AddReactions: true,
  AttachFiles: true,
  EmbedLinks: true,
};

const VOICE_ACCESS = {
  ViewChannel: true,
  Connect: true,
  Speak: true,
  UseVAD: true,
};

/**
 * Categories with their channels
 * Each category has:
 * - name: Display name with emoji
 * - channels: Array of text/voice channels
 * - permissions: Function that returns permission overwrites given role IDs
 */
const categories = [
  {
    name: '🧟 ZOMBIE GATES',
    channels: [
      {
        name: '🚪-welcome',
        type: ChannelType.GuildText,
        topic: 'Welcome to Legion of Fools! Read the rules and verify to get started.',
        // Everyone can view but not send
        getPermissions: (roles, guildId) => [
          { id: guildId, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
        ],
      },
      {
        name: '📕-rules',
        type: ChannelType.GuildText,
        topic: 'Alliance rules and expectations. Read before verifying!',
        getPermissions: (roles, guildId) => [
          { id: guildId, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
        ],
      },
      {
        name: '🔔-announcements',
        type: ChannelType.GuildText,
        topic: 'Important alliance announcements from leadership.',
        getPermissions: (roles, guildId) => [
          { id: guildId, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
          { id: roles.member, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
          { id: roles.r4, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
          { id: roles.r5, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
      {
        name: '🛡️-alliance-info',
        type: ChannelType.GuildText,
        topic: 'NAP list, allies, and enemy KOS list.',
        getPermissions: (roles, guildId) => [
          { id: guildId, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
        ],
      },
    ],
  },
  {
    name: '⚜️ VERIFICATION',
    channels: [
      {
        name: '✨-verify-member',
        type: ChannelType.GuildText,
        topic: 'Click the Verify button to submit your IGN and get access.',
        getPermissions: (roles, guildId) => [
          // Everyone can see but not send messages
          { id: guildId, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
          // Members should not see this channel after verification
          { id: roles.member, deny: [PermissionFlagsBits.ViewChannel] },
          // Diplomats should not see this either - they use diplomat-request
          { id: roles.diplomat, deny: [PermissionFlagsBits.ViewChannel] },
        ],
      },
      {
        name: '🤝-diplomat-request',
        type: ChannelType.GuildText,
        topic: 'Diplomats from other alliances can request access here.',
        getPermissions: (roles, guildId) => [
          { id: guildId, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
          // Members should not see this
          { id: roles.member, deny: [PermissionFlagsBits.ViewChannel] },
          // Diplomats who already have role shouldn't see this either
          { id: roles.diplomat, deny: [PermissionFlagsBits.ViewChannel] },
        ],
      },
    ],
  },
  {
    name: '🍻 THE TAVERN',
    channels: [
      {
        name: '💬-general-chat',
        type: ChannelType.GuildText,
        topic: 'Hang out and chat with fellow LOF members!',
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.member, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
      {
        name: '🎭-memes',
        type: ChannelType.GuildText,
        topic: 'Share your best memes here!',
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.member, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
      {
        name: '🎲-off-topic',
        type: ChannelType.GuildText,
        topic: 'Talk about anything not related to the game.',
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.member, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
      {
        name: '📝-introductions',
        type: ChannelType.GuildText,
        topic: 'Introduce yourself to the alliance!',
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.member, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
      {
        name: '🎮-bot-commands',
        type: ChannelType.GuildText,
        topic: 'Use music bots, meme bots, and other fun commands here!',
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.member, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
    ],
  },
  {
    name: '⚔️ WAR COUNCIL',
    channels: [
      {
        name: '🚨-war-announcements',
        type: ChannelType.GuildText,
        topic: 'Rally calls and war announcements from officers.',
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.member, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
          { id: roles.r4, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
      {
        name: '🗺️-strategy',
        type: ChannelType.GuildText,
        topic: 'Discuss war strategies and tactics.',
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.member, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
    ],
  },
  {
    name: '📚 LIBRARY',
    channels: [
      {
        name: '📖-game-guides',
        type: ChannelType.GuildText,
        topic: 'Game guides and tutorials.',
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.member, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
      {
        name: '💎-tips-and-tricks',
        type: ChannelType.GuildText,
        topic: 'Share your tips and tricks!',
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.member, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
      {
        name: '❔-ask-questions',
        type: ChannelType.GuildText,
        topic: 'Ask questions and get help from other members.',
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.member, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
    ],
  },
  {
    name: '🌐 DIPLOMACY',
    channels: [
      {
        name: '🕊️-diplo-lounge',
        type: ChannelType.GuildText,
        topic: 'Chat with diplomats from other alliances.',
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel] },
          // Members cannot see this
          { id: roles.member, deny: [PermissionFlagsBits.ViewChannel] },
          // Only diplomats and R4/R5 can see
          { id: roles.diplomat, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
          { id: roles.r4, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
      {
        name: '🔐-alliance-relations',
        type: ChannelType.GuildText,
        topic: 'Internal diplomacy planning (R4/R5 only).',
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.member, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.diplomat, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.r4, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
    ],
  },
  {
    name: '👑 HIGH COMMAND',
    channels: [
      {
        name: '💠-officer-chat',
        type: ChannelType.GuildText,
        topic: 'Private officer discussion.',
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.r4, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
      {
        name: '📋-officer-notes',
        type: ChannelType.GuildText,
        topic: 'Member issues, promotions, warnings, and verification approvals.',
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.r4, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
      {
        name: '📜-applications',
        type: ChannelType.GuildText,
        topic: 'Recruitment applications from outside the alliance.',
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.r4, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
      {
        name: '📢-officer-announcements',
        type: ChannelType.GuildText,
        topic: 'Important announcements for officers only.',
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel] },
          { id: roles.r4, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      },
    ],
  },
  {
    name: '🎙️ VOICE HALLS',
    channels: [
      {
        name: '🍺 Tavern Voice',
        type: ChannelType.GuildVoice,
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect] },
          { id: roles.member, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] },
        ],
      },
      {
        name: '⚔️ War Room',
        type: ChannelType.GuildVoice,
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect] },
          { id: roles.member, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] },
        ],
      },
      {
        name: '🌍 Diplo Chamber',
        type: ChannelType.GuildVoice,
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect] },
          // Members cannot see or join
          { id: roles.member, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect] },
          // Only diplomats and R4/R5
          { id: roles.diplomat, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] },
          { id: roles.r4, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] },
        ],
      },
      {
        name: '👑 Command Center',
        type: ChannelType.GuildVoice,
        getPermissions: (roles, guildId) => [
          { id: guildId, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect] },
          { id: roles.r4, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] },
        ],
      },
    ],
  },
];

module.exports = { categories };
