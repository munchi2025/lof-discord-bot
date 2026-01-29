const { PermissionFlagsBits } = require('discord.js');

/**
 * Permission utilities for LOF Discord bot
 */

/**
 * Check if bot has required permissions in a guild
 * @param {Guild} guild - Discord guild
 * @param {Array} requiredPermissions - Array of PermissionFlagsBits
 * @returns {Object} - { hasAll: boolean, missing: Array }
 */
function checkBotPermissions(guild, requiredPermissions) {
  const botMember = guild.members.me;
  if (!botMember) {
    return { hasAll: false, missing: requiredPermissions };
  }

  const missing = requiredPermissions.filter(
    (perm) => !botMember.permissions.has(perm)
  );

  return {
    hasAll: missing.length === 0,
    missing,
  };
}

/**
 * Required permissions for setup command
 */
const SETUP_PERMISSIONS = [
  PermissionFlagsBits.ManageGuild,
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.ManageRoles,
  PermissionFlagsBits.ManageNicknames,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.EmbedLinks,
];

/**
 * Permission flag names for display
 */
const PERMISSION_NAMES = {
  [PermissionFlagsBits.ManageGuild]: 'Manage Server',
  [PermissionFlagsBits.ManageChannels]: 'Manage Channels',
  [PermissionFlagsBits.ManageRoles]: 'Manage Roles',
  [PermissionFlagsBits.ManageNicknames]: 'Manage Nicknames',
  [PermissionFlagsBits.SendMessages]: 'Send Messages',
  [PermissionFlagsBits.EmbedLinks]: 'Embed Links',
  [PermissionFlagsBits.Administrator]: 'Administrator',
};

/**
 * Get human-readable name for a permission
 * @param {BigInt} permission - Permission flag
 * @returns {String} - Human-readable name
 */
function getPermissionName(permission) {
  return PERMISSION_NAMES[permission] || 'Unknown Permission';
}

/**
 * Format missing permissions as a string list
 * @param {Array} missing - Array of missing PermissionFlagsBits
 * @returns {String} - Formatted string
 */
function formatMissingPermissions(missing) {
  return missing.map((perm) => `• ${getPermissionName(perm)}`).join('\n');
}

module.exports = {
  checkBotPermissions,
  SETUP_PERMISSIONS,
  PERMISSION_NAMES,
  getPermissionName,
  formatMissingPermissions,
};
