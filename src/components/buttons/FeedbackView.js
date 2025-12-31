const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { getEmoji } = require('../../utils/emojis');
const { generateReviewId, saveReview } = require('../../utils/reviews');
const { getConfig } = require('../../utils/config');

// Armazenamento temporário de estados de feedback (já que não temos persistência de banco de dados aqui)
const feedbackStates = new Map();

function getFeedbackRow(step, ticketId, staffName) {
    const row = new ActionRowBuilder();
    if (step === 1) {
        for (let i = 1; i <= 5; i++) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`star_${i}_${ticketId}_${staffName}`)
                    .setLabel(i.toString())
                    .setEmoji(getEmoji('star'))
                    .setStyle(ButtonStyle.Secondary)
            );
        }
    } else if (step === 2) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`feedback_comment_btn_${ticketId}_${staffName}`)
                .setLabel('Comentário')
                .setEmoji(getEmoji('notes'))
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`feedback_finish_btn_${ticketId}_${staffName}`)
                .setLabel('Finalizar')
                .setEmoji(getEmoji('confirm'))
                .setStyle(ButtonStyle.Success)
        );
    }
    return row;
}

async function handleFeedback(interaction) {
    const customId = interaction.customId;
    const parts = customId.split('_');
    const action = parts[0];
    
    // star_N_ticketId_staffName
    // feedback_comment_btn_ticketId_staffName
    // feedback_finish_btn_ticketId_staffName

    if (action === 'star') {
        const stars = parseInt(parts[1]);
        const ticketId = parts[2];
        const staffName = parts[3];
        
        feedbackStates.set(interaction.user.id, { stars, ticketId, staffName, comment: null });
        
        await interaction.update({ components: [getFeedbackRow(2, ticketId, staffName)] });
    } else if (action === 'feedback' && parts[1] === 'comment') {
        const modal = new ModalBuilder()
            .setCustomId('comment_modal')
            .setTitle('Deixe seu comentário');

        const commentInput = new TextInputBuilder()
            .setCustomId('comment_input')
            .setLabel("Comentário")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(500);

        modal.addComponents(new ActionRowBuilder().addComponents(commentInput));
        await interaction.showModal(modal);
    } else if (action === 'feedback' && parts[1] === 'finish') {
        const state = feedbackStates.get(interaction.user.id);
        if (!state) {
            return await interaction.reply({ content: "❌ Sua sessão de avaliação expirou ou o bot foi reiniciado. Por favor, tente novamente clicando nas estrelas na mensagem original.", ephemeral: true });
        }

        // Primeiro atualizamos a interface para o usuário não ver "Interação falhou"
        const thanksEmbed = new EmbedBuilder()
            .setTitle("Avaliação Enviada!")
            .setDescription(`## \`✅\` \`Muito obrigado!\`\n\nSua avaliação foi registrada com sucesso.\n\n**Sua nota:** ${getEmoji('star').repeat(state.stars)}\n**Comentário:** ${state.comment || 'Nenhum'}`)
            .setColor("#242429");

        await interaction.update({ content: null, embeds: [thanksEmbed], components: [] });

        // Depois processamos o salvamento e o log (fora do tempo crítico da interação)
        const rid = generateReviewId();
        const reviewData = {
            user: interaction.user.tag,
            stars: state.stars,
            comment: state.comment,
            staff: state.staffName,
            date: new Date().toISOString()
        };
        saveReview(rid, reviewData);

        const feedbackChannelId = String(getConfig('feedback_channel_id'));
        if (feedbackChannelId && feedbackChannelId !== 'undefined') {
            try {
                const fChannel = await interaction.client.channels.fetch(feedbackChannelId).catch(() => null);
                if (fChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle("Nova Avaliação")
                        .setColor("#00FF00")
                        .addFields(
                            { name: "Nota", value: getEmoji('star').repeat(state.stars) },
                            { name: "Staff", value: state.staffName }
                        )
                        .setDescription(`**Comentário:**\n\`\`\`${state.comment || 'Sem comentário'}\`\`\``);
                    await fChannel.send({ embeds: [embed] });
                }
            } catch (e) {
                console.error("Erro ao enviar log de avaliação:", e);
            }
        }
        
        feedbackStates.delete(interaction.user.id);
    }
}

module.exports = { handleFeedback, getFeedbackRow, feedbackStates };

