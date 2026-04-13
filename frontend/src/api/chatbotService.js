import axios from './axios';

export const sendMessage = async (message, history = [], imageBase64 = null) => {
    const payload = {
        message: message,
        history: history,
    };

    // Ajouter l'image seulement si elle existe
    if (imageBase64) {
        payload.image = imageBase64;
    }

    const response = await axios.post('/chatbot', payload);
    return response.data.reply;
};

// Fonction utilitaire pour convertir un fichier en base64
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Erreur lecture fichier'));
        reader.readAsDataURL(file);
    });
};