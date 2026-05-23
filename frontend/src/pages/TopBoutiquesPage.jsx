import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Trophy, Truck } from 'lucide-react';
import { getTopBoutiquesByCity } from '../api/cityService';
import { TopGoldCard } from '../components/TopGoldCard';
import FashionAuraLogo from '../components/common/FashionAuraLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import CustomCursor from '../components/CustomCursor';
import '../styles/top-partners.css';

function flattenTopBoutiques(citiesData) {
  if (!citiesData?.length) return [];
  return citiesData.flatMap(({ city, boutiques }) =>
    (boutiques || []).map((boutique, index) => ({
      boutique,
      city,
      rank: index + 1,
      key: `${city.id}-${boutique.id}`,
    }))
  );
}

export const TopBoutiquesPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState({ message: '', cities: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTopBoutiquesByCity()
      .then(setData)
      .catch(() => setError(t('top_boutiques.error')))
      .finally(() => setLoading(false));
  }, [t]);

  const allEntries = useMemo(() => flattenTopBoutiques(data.cities), [data.cities]);
  const cityCount = data.cities?.length || 0;

  return (
    <>
      <CustomCursor />
      <div className="top-gold-page">
        <div className="top-gold-page__inner">
          <div className="top-gold-page__banner">
            <nav className="top-gold-page__nav">
              <FashionAuraLogo to="/" size="md" variant="light" />
              <LanguageSwitcher variant="landing" />
              <Link to="/#top-partners" className="top-gold-page__back">
                <ArrowLeft size={16} />
                {t('top_boutiques.back_home')}
              </Link>
            </nav>

            <header className="top-gold-page__hero">
              <span className="top-gold-page__badge">
                <Trophy size={14} />
                {t('top_boutiques.badge')}
              </span>
              <h1 className="top-gold-page__title">{t('top_boutiques.title')}</h1>
              <p className="top-gold-page__subtitle">
                {data.message || t('top_boutiques.unified_subtitle')}
              </p>
              <p className="top-gold-page__hint">
                <Truck size={14} />
                {t('top_boutiques.delivery_hint')}
              </p>
            </header>
          </div>

          <div className="top-gold-page__body">
          {loading && (
            <div className="top-gold-page__loading">
              <div className="top-gold-page__spinner" />
              <p>{t('top_boutiques.loading')}</p>
            </div>
          )}

          {error && <p className="top-gold-page__empty">{error}</p>}

          {!loading && !error && allEntries.length > 0 && (
            <>
              <p className="top-gold-page__count">
                {t('top_boutiques.total_count', {
                  count: allEntries.length,
                  cities: cityCount,
                })}
              </p>
              <div className="top-gold-page__grid">
                {allEntries.map(({ boutique, city, rank, key }) => (
                  <TopGoldCard
                    key={key}
                    boutique={boutique}
                    city={city}
                    rank={rank}
                  />
                ))}
              </div>
            </>
          )}

          {!loading && !error && allEntries.length === 0 && (
            <p className="top-gold-page__empty">{t('top_boutiques.empty')}</p>
          )}

          <footer className="top-gold-page__footer">
            <p>{t('footer.synthesis')}</p>
          </footer>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopBoutiquesPage;
