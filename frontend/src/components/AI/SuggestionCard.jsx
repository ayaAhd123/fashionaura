import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const SuggestionCard = ({ suggestion }) => {
    const { t } = useTranslation();
    const isProduct = suggestion.type === 'product';
    const link = suggestion.url || (isProduct ? `/products/${suggestion.slug}` : `/boutiques/${suggestion.slug}`);
    const subtitle = isProduct
        ? `${suggestion.boutique_name}${suggestion.city ? ` · ${suggestion.city}` : ''}`
        : `${suggestion.city || t('chatbot.country_fallback')} · ${t('chatbot.type_boutique')}`;

    return (
        <Link to={link} className="chat-suggestion-card">
            <div className="chat-suggestion-card__image">
                {suggestion.image ? (
                    <img src={suggestion.image} alt={suggestion.name} />
                ) : (
                    <span className="chat-suggestion-card__placeholder">{isProduct ? 'P' : 'B'}</span>
                )}
            </div>
            <div className="chat-suggestion-card__body">
                <p className="chat-suggestion-card__type">
                    {isProduct ? t('chatbot.type_product') : t('chatbot.type_boutique')}
                </p>
                <h5 className="chat-suggestion-card__title">{suggestion.name}</h5>
                <p className="chat-suggestion-card__meta">{subtitle}</p>
                {suggestion.price != null && (
                    <p className="chat-suggestion-card__price">{suggestion.price} DH</p>
                )}
                <span className="chat-suggestion-card__cta">{t('chatbot.cta_view')}</span>
            </div>
        </Link>
    );
};

export default SuggestionCard;
