/**
 * Member Verification Handler
 * Handles member verification with IGN modal and officer approval
 */

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

/**
 * Handle verify button click - show IGN modal
 */
async function handleMemberVerification(interaction) {
  // Check if user already has Member role
  const memberRole = interaction.guild.roles.cache.find(
    (role) => role.name === 'Member'
  );

  if (memberRole && interaction.member.roles.cache.has(memberRole.id)) {
    return interaction.reply({
      content: '✅ You are already verified!',
      ephemeral: true,
    });
  }

  // Check if user already has a pending verification
  if (interaction.client.pendingVerifications.has(interaction.user.id)) {
    return interaction.reply({
      content: '⏳ You already have a pending verification request. Please wait for an officer to approve it.',
      ephemeral: true,
    });
  }

  // Create modal for IGN input
  const modal = new ModalBuilder()
    .setCustomId('verify_ign_modal')
    .setTitle('🛡️ LOF Member Verification');

  const ignInput = new TextInputBuilder()
    .setCustomId('ign_input')
    .setLabel('Enter your In-Game Name (IGN)')
    .setPlaceholder('e.g., WarriorKing123')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMinLength(2)
    .setMaxLength(30);

  const actionRow = new ActionRowBuilder().addComponents(ignInput);
  modal.addComponents(actionRow);

  await interaction.showModal(modal);
}

/**
 * Process IGN submission from modal
 */
async function processIGNSubmission(interaction) {
  const ign = interaction.fields.getTextInputValue('ign_input').trim();
  const userId = interaction.user.id;
  const userTag = interaction.user.tag;

  // Store pending verification
  interaction.client.pendingVerifications.set(userId, {
    ign,
    userTag,
    timestamp: Date.now(),
  });

  // Find officer notes channel
  const officerChannel = interaction.guild.channels.cache.find(
    (ch) => ch.name === '📋-officer-notes'
  );

  if (!officerChannel) {
    await interaction.reply({
      content: '❌ Error: Officer channel not found. Please contact an administrator.',
      ephemeral: true,
    });
    interaction.client.pendingVerifications.delete(userId);
    return;
  }

  // Create approval request embed
  const approvalEmbed = new EmbedBuilder()
    .setColor(0xFFA500) // Orange for pending
    .setTitle('📋 New Member Verification Request')
    .setThumbnail(interaction.user.displayAvatarURL())
    .addFields(
      {
        name: 'Discord User',
        value: `<@${userId}> (${userTag})`,
        inline: true,
      },
      {
        name: 'Requested IGN',
        value: `\`${ign}\``,
        inline: true,
      },
      {
        name: 'Account Created',
        value: `<t:${Math.floor(interaction.user.createdTimestamp / 1000)}:R>`,
        inline: true,
      }
    )
    .setFooter({ text: 'Click Approve to verify this member or Deny to reject.' })
    .setTimestamp();

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`approve_member_${userId}`)
      .setLabel('Approve')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅'),
    new ButtonBuilder()
      .setCustomId(`deny_member_${userId}`)
      .setLabel('Deny')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('❌')
  );

  await officerChannel.send({ embeds: [approvalEmbed], components: [buttons] });

  // Confirm to user
  await interaction.reply({
    content: `✅ Your verification request has been submitted!\n\n**IGN:** \`${ign}\`\n\nPlease wait for an R4+ officer to approve your request.`,
    ephemeral: true,
  });
}

/**
 * Handle verification approval/denial
 */
async function handleVerificationApproval(interaction, approved) {
  // Extract user ID from button custom ID
  const userId = interaction.customId.split('_').pop();

  // Get pending verification
  const pending = interaction.client.pendingVerifications.get(userId);

  if (!pending) {
    return interaction.reply({
      content: '❌ This verification request has expired or was already processed.',
      ephemeral: true,
    });
  }

  // Get the member to verify
  let member;
  try {
    member = await interaction.guild.members.fetch(userId);
  } catch (error) {
    interaction.client.pendingVerifications.delete(userId);
    return interaction.update({
      content: '❌ User is no longer in the server.',
      embeds: [],
      components: [],
    });
  }

  if (approved) {
    // Find Member role
    const memberRole = interaction.guild.roles.cache.find(
      (role) => role.name === 'Member'
    );

    if (!memberRole) {
      return interaction.reply({
        content: '❌ Member role not found. Please run /setup first.',
        ephemeral: true,
      });
    }

    try {
      // Set nickname to IGN
      await member.setNickname(pending.ign, 'Member verification approved');

      // Add Member role
      await member.roles.add(memberRole, 'Member verification approved');

      // Update the approval message
      const approvedEmbed = new EmbedBuilder()
        .setColor(0x50C878) // Green for approved
        .setTitle('✅ Member Verified')
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
          {
            name: 'Discord User',
            value: `<@${userId}>`,
            inline: true,
          },
          {
            name: 'IGN',
            value: `\`${pending.ign}\``,
            inline: true,
          },
          {
            name: 'Approved By',
            value: `<@${interaction.user.id}>`,
            inline: true,
          }
        )
        .setTimestamp();

      await interaction.update({
        embeds: [approvedEmbed],
        components: [],
      });

      // Try to DM the user
      try {
        await member.send({
          content: `✅ **Welcome to Legion of Fools!**\n\nYour verification has been approved.\n**Your nickname has been set to:** \`${pending.ign}\`\n\nYou now have access to all member channels. Enjoy!`,
        });
      } catch (error) {
        // User has DMs disabled, ignore
      }

    } catch (error) {
      console.error('Verification approval error:', error);
      return interaction.reply({
        content: `❌ Failed to verify member: ${error.message}`,
        ephemeral: true,
      });
    }
  } else {
    // Denied
    const deniedEmbed = new EmbedBuilder()
      .setColor(0xFF0000) // Red for denied
      .setTitle('❌ Verification Denied')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        {
          name: 'Discord User',
          value: `<@${userId}>`,
          inline: true,
        },
        {
          name: 'Requested IGN',
          value: `\`${pending.ign}\``,
          inline: true,
        },
        {
          name: 'Denied By',
          value: `<@${interaction.user.id}>`,
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.update({
      embeds: [deniedEmbed],
      components: [],
    });

    // Try to DM the user
    try {
      await member.send({
        content: `❌ Your verification request for Legion of Fools has been denied.\n\nIf you believe this is a mistake, please contact an officer.`,
      });
    } catch (error) {
      // User has DMs disabled, ignore
    }
  }

  // Remove from pending
  interaction.client.pendingVerifications.delete(userId);
}

module.exports = {
  handleMemberVerification,
  processIGNSubmission,
  handleVerificationApproval,
};
