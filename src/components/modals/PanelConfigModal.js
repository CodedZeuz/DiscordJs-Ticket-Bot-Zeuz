const { saveConfig } = require('../../utils/config');

async function onSubmit(interaction) {
    const title = interaction.fields.getTextInputValue('title_input');
    const desc = interaction.fields.getTextInputValue('desc_input');
    const color = interaction.fields.getTextInputValue('color_input');
    const image = interaction.fields.getTextInputValue('image_input');
    const buttonText = interaction.fields.getTextInputValue('button_input');

    const newData = {};
    if (title) newData.panel_title = title;
    if (desc) newData.panel_description = desc;
    if (color) newData.panel_color = color;
    if (image) newData.panel_image = image;
    if (buttonText) newData.panel_button_text = buttonText;

    saveConfig(newData);

    // Avançar para o próximo passo do Wizard (ou finalizar)
    const { handleWizard } = require('../buttons/ConfigWizardView');
    // Simulamos um avanço enviando o passo 8 (que é o final no Wizard JS)
    await handleWizard(interaction, 8);
}

module.exports = { onSubmit };

