const { PermissionFlagsBits } = require('discord.js');

/**
 * Role definitions for LOF Discord server
 * Order matters - roles are created from bottom to top (Member first, R5 last)
 * This ensures proper hierarchy in Discord
 */
const roles = [
  {
    name: 'Member',
    color: 0x50C878, // Emerald
    permissions: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.Connect,
      PermissionFlagsBits.Speak,
      PermissionFlagsBits.UseVAD,
      PermissionFlagsBits.AddReactions,
      PermissionFlagsBits.AttachFiles,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.UseExternalEmojis,
    ],
    hoist: false,
    mentionable: false,
  },
  {
    name: 'Diplomat',
    color: 0x7B68EE, // Royal Purple
    permissions: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.Connect,
      PermissionFlagsBits.Speak,
      PermissionFlagsBits.UseVAD,
      PermissionFlagsBits.AddReactions,
      PermissionFlagsBits.AttachFiles,
      PermissionFlagsBits.EmbedLinks,
    ],
    hoist: true, // Show separately in member list
    mentionable: true,
  },
  {
    name: 'R4 - Officer',
    color: 0xDC143C, // Crimson
    permissions: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.Connect,
      PermissionFlagsBits.Speak,
      PermissionFlagsBits.UseVAD,
      PermissionFlagsBits.AddReactions,
      PermissionFlagsBits.AttachFiles,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.UseExternalEmojis,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ManageNicknames,
      PermissionFlagsBits.KickMembers,
      PermissionFlagsBits.MuteMembers,
      PermissionFlagsBits.DeafenMembers,
      PermissionFlagsBits.MoveMembers,
      PermissionFlagsBits.MentionEveryone,
    ],
    hoist: true,
    mentionable: true,
  },
  {
    name: 'R5 - Leader',
    color: 0xFFD700, // Gold
    permissions: [PermissionFlagsBits.Administrator],
    hoist: true,
    mentionable: true,
  },
];

module.exports = { roles };
