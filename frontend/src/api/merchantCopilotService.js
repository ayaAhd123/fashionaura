import api from '../services/api';

export const sendMerchantCopilotMessage = async (message, history = [], period = '30days', locale = 'fr') => {
  const response = await api.post('/boutique/copilot/chat', {
    message,
    history,
    period,
    locale: locale?.split('-')[0] || 'fr',
  });
  return {
    reply: response.data.reply,
    suggestions: response.data.suggestions || [],
  };
};
