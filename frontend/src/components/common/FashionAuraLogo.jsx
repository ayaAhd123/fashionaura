import React from 'react';
import { Link } from 'react-router-dom';
/**
 * Logo unifié Fashion + Aura sur tout le site.
 * @param {'sm'|'md'|'lg'} size
 * @param {'default'|'light'|'onDark'} variant
 */
export const FashionAuraLogo = ({
    to = '/',
    className = '',
    size = 'md',
    variant = 'default',
    asLink = true,
}) => {
    const classes = ['fa-logo', `fa-logo--${size}`, `fa-logo--${variant}`, className]
        .filter(Boolean)
        .join(' ');

    const content = (
        <>
            <span className="fa-logo__fashion">Fashion</span>
            <span className="fa-logo__aura">Aura</span>
        </>
    );

    if (!asLink) {
        return <span className={classes}>{content}</span>;
    }

    return (
        <Link to={to} className={classes}>
            {content}
        </Link>
    );
};

export default FashionAuraLogo;
