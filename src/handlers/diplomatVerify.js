/**
 * Diplomat Verification Handler
 * Handles diplomat access requests with officer approval
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
 * Handle diplomat request button click
 */
async function handleDiplomatRequest(interaction) {
  // Check if user already has Diplomat role
  const diplomatRole = interaction.guild.roles.cache.find(
    (role) => role.name === 'Diplomat'
  );

  if (diplomatRole && interaction.member.roles.cache.has(diplomatRole.id)) {
    return interaction.reply({
      content: '✅ You already have diplomat access!',
      ephemeral: true,
    });
  }

  // Check if user already has Member role (they should use member verification)
  const memberRole = interaction.guild.roles.cache.find(
    (role) => role.name === 'Member'
  );

  if (memberRole && interaction.member.roles.cache.has(memberRole.id)) {
    return interaction.reply({
      content: '❌ You are already a verified LOF member. Diplomat access is for members of other alliances.',
      ephemeral: true,
    });
  }

  // Check if user already has a pending request
  if (interaction.client.pendingDiplomats.has(interaction.user.id)) {
    return interaction.reply({
      content: '⏳ You already have a pending diplomat request. Please wait for an officer to review it.',
      ephemeral: true,
    });
  }

  // Show modal for alliance info
  const modal = new ModalBuilder()
    .setCustomId('diplomat_request_modal')
    .setTitle('🌐 Diplomat Access Request');

  const allianceInput = new TextInputBuilder()
    .setCustomId('alliance_input')
    .setLabel('What alliance are you from?')
    .setPlaceholder('e.g., Warriors United [WU]')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMinLength(2)
    .setMaxLength(50);

  const ignInput = new TextInputBuilder()
    .setCustomId('diplo_ign_input')
    .setLabel('Your In-Game Name (IGN)')
    .setPlaceholder('e.g., DiplomatKing123')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMinLength(2)
    .setMaxLength(30);

  const reasonInput = new TextInputBuilder()
    .setCustomId('reason_input')
    .setLabel('Why are you requesting diplomat access?')
    .setPlaceholder('e.g., Discussing NAP agreement, coordinating joint events...')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(200);

  modal.addComponents(
    new ActionRowBuilder().addComponents(allianceInput),
    new ActionRowBuilder().addComponents(ignInput),
    new ActionRowBuilder().addComponents(reasonInput)
  );

  await interaction.showModal(modal);
}

/**
 * Process diplomat request modal submission
 */
async function processDiplomatSubmission(interaction) {
  const alliance = interaction.fields.getTextInputValue('alliance_input').trim();
  const ign = interaction.fields.getTextInputValue('diplo_ign_input').trim();
  const reason = interaction.fields.getTextInputValue('reason_input')?.trim() || 'Not specified';

  const userId = interaction.user.id;
  const userTag = interaction.user.tag;

  // Store pending diplomat request
  interaction.client.pendingDiplomats.set(userId, {
    alliance,
    ign,
    reason,
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
    interaction.client.pendingDiplomats.delete(userId);
    return;
  }

  // Create approval request embed
  const approvalEmbed = new EmbedBuilder()
    .setColor(0x7B68EE) // Purple for diplomat
    .setTitle('🌐 New Diplomat Access Request')
    .setThumbnail(interaction.user.displayAvatarURL())
    .addFields(
      {
        name: 'Discord User',
        value: `<@${userId}> (${userTag})`,
        inline: true,
      },
      {
        name: 'Alliance',
        value: `\`${alliance}\``,
        inline: true,
      },
      {
        name: 'IGN',
        value: `\`${ign}\``,
        inline: true,
      },
      {
        name: 'Reason',
        value: reason,
        inline: false,
      },
      {
        name: 'Account Created',
        value: `<t:${Math.floor(interaction.user.createdTimestamp / 1000)}:R>`,
        inline: true,
      }
    )
    .setFooter({ text: 'Click Approve to grant diplomat access or Deny to reject.' })
    .setTimestamp();

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`approve_diplomat_${userId}`)
      .setLabel('Approve')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅'),
    new ButtonBuilder()
      .setCustomId(`deny_diplomat_${userId}`)
      .setLabel('Deny')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('❌')
  );

  await officerChannel.send({ embeds: [approvalEmbed], components: [buttons] });

  // Confirm to user
  await interaction.reply({
    content: `✅ Your diplomat access request has been submitted!\n\n**Alliance:** \`${alliance}\`\n**IGN:** \`${ign}\`\n\nPlease wait for an R4+ officer to review your request.`,
    ephemeral: true,
  });
}

/**
 * Handle diplomat approval/denial
 */
async function handleDiplomatApproval(interaction, approved) {
  // Extract user ID from button custom ID
  const userId = interaction.customId.split('_').pop();

  // Get pending diplomat request
  const pending = interaction.client.pendingDiplomats.get(userId);

  if (!pending) {
    return interaction.reply({
      content: '❌ This diplomat request has expired or was already processed.',
      ephemeral: true,
    });
  }

  // Get the member
  let member;
  try {
    member = await interaction.guild.members.fetch(userId);
  } catch (error) {
    interaction.client.pendingDiplomats.delete(userId);
    return interaction.update({
      content: '❌ User is no longer in the server.',
      embeds: [],
      components: [],
    });
  }

  if (approved) {
    // Find Diplomat role
    const diplomatRole = interaction.guild.roles.cache.find(
      (role) => role.name === 'Diplomat'
    );

    if (!diplomatRole) {
      return interaction.reply({
        content: '❌ Diplomat role not found. Please run /setup first.',
        ephemeral: true,
      });
    }

    try {
      // Set nickname to include alliance tag
      const nickname = `[${pending.alliance.split('[')[1]?.replace(']', '') || pending.alliance.substring(0, 3).toUpperCase()}] ${pending.ign}`;
      await member.setNickname(nickname.substring(0, 32), 'Diplomat access approved');

      // Add Diplomat role
      await member.roles.add(diplomatRole, 'Diplomat access approved');

      // Update the approval message
      const approvedEmbed = new EmbedBuilder()
        .setColor(0x50C878) // Green for approved
        .setTitle('✅ Diplomat Access Granted')
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
          {
            name: 'Discord User',
            value: `<@${userId}>`,
            inline: true,
          },
          {
            name: 'Alliance',
            value: `\`${pending.alliance}\``,
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
          content: `✅ **Diplomat Access Granted!**\n\nYour diplomat access request for Legion of Fools has been approved.\n\nYou now have access to the diplomacy channels. Welcome!`,
        });
      } catch (error) {
        // User has DMs disabled, ignore
      }

    } catch (error) {
      console.error('Diplomat approval error:', error);
      return interaction.reply({
        content: `❌ Failed to grant diplomat access: ${error.message}`,
        ephemeral: true,
      });
    }
  } else {
    // Denied
    const deniedEmbed = new EmbedBuilder()
      .setColor(0xFF0000) // Red for denied
      .setTitle('❌ Diplomat Access Denied')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        {
          name: 'Discord User',
          value: `<@${userId}>`,
          inline: true,
        },
        {
          name: 'Alliance',
          value: `\`${pending.alliance}\``,
          inline: true,
        },
        {
          name: 'IGN',
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
        content: `❌ Your diplomat access request for Legion of Fools has been denied.\n\nIf you believe this is a mistake, please contact an officer.`,
      });
    } catch (error) {
      // User has DMs disabled, ignore
    }
  }

  // Remove from pending
  interaction.client.pendingDiplomats.delete(userId);
}

module.exports = {
  handleDiplomatRequest,
  processDiplomatSubmission,
  handleDiplomatApproval,
};
