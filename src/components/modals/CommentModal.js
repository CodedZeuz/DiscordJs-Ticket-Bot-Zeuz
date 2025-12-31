const { feedbackStates } = require('../buttons/FeedbackView');

async function onSubmit(interaction) {
    const comment = interaction.fields.getTextInputValue('comment_input');
    const state = feedbackStates.get(interaction.user.id);
    
    if (state) {
        state.comment = comment;
        feedbackStates.set(interaction.user.id, state);
    }

    await interaction.reply({ content: "Comentário adicionado! Clique em **Finalizar** para enviar sua avaliação.", ephemeral: true });
}

module.exports = { onSubmit };

