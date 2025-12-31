// Este arquivo vai centralizar a lógica de botões, menus e modais
// Para cada componente, ele busca o handler correspondente

const { InteractionType } = require('discord.js');

module.exports = async (interaction, client) => {
    // Custom ID pattern: action_target_id ou apenas action
    const customId = interaction.customId;
    
    // Botoes e Menus do Painel de Tickets
    if (customId === 'ticket_open_btn') {
        const { openTicket } = require('../components/buttons/TicketPanelView');
        return await openTicket(interaction);
    }

    if (customId === 'close_btn') {
        const { closeTicket } = require('../components/buttons/TicketActionsView');
        return await closeTicket(interaction);
    }

    if (customId === 'claim_btn') {
        const { claimTicket } = require('../components/buttons/TicketActionsView');
        return await claimTicket(interaction);
    }

    // Wizard de Configuracao
    if (customId === 'config_wizard_continue' || customId === 'config_role_select' || 
        customId === 'config_cat_open' || customId === 'config_cat_claimed' || 
        customId === 'config_chan_transcript' || customId === 'config_chan_feedback' ||
        customId === 'config_visual_btn' || customId === 'config_finish_btn') {
        const { handleWizard } = require('../components/buttons/ConfigWizardView');
        return await handleWizard(interaction);
    }

    // Feedback / Estrelas
    if (customId?.startsWith('star_') || customId?.startsWith('feedback_comment_btn_') || customId?.startsWith('feedback_finish_btn_')) {
        const { handleFeedback } = require('../components/buttons/FeedbackView');
        return await handleFeedback(interaction);
    }

    // Modais
    if (interaction.type === InteractionType.ModalSubmit) {
        if (customId === 'panel_config_modal') {
            const { onSubmit } = require('../components/modals/PanelConfigModal');
            return await onSubmit(interaction);
        }
        if (customId === 'comment_modal') {
            const { onSubmit } = require('../components/modals/CommentModal');
            return await onSubmit(interaction);
        }
    }
};

