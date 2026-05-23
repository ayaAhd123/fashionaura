import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { boutiqueService } from '../services/boutiqueService';
import { BoutiqueCard } from '../components/BoutiqueCard';
import '../styles/shop-pages.css';

const CITY_SLUGS = ['casablanca', 'marrakech', 'rabat', 'tanger', 'fes', 'agadir'];

export const BoutiquesPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    rating: searchParams.get('rating') || '',
  });
  const [following, setFollowing] = useState({});

  useEffect(() => {
    fetchBoutiques();
  }, [filters, page]);

  const fetchBoutiques = async () => {
    try {
      setLoading(true);
      const data = await boutiqueService.getBoutiques({ ...filters, page });
      setBoutiques(data.data || data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const handleFollow = async (boutiqueId) => {
    const isNowFollowing = !following[boutiqueId];
    try {
      if (following[boutiqueId]) {
        await boutiqueService.unfollowBoutique(boutiqueId);
      } else {
        await boutiqueService.followBoutique(boutiqueId);
      }
      setFollowing({ ...following, [boutiqueId]: isNowFollowing });
    } catch {
      setFollowing({ ...following, [boutiqueId]: isNowFollowing });
    }
  };

  return (
    <div className="shop-page">
      <section className="shop-page__hero">
        <div className="shop-page__hero-inner">
          <h1 className="shop-page__title">{t('boutiques_page.title')}</h1>
          <p className="shop-page__subtitle">{t('boutiques_page.subtitle')}</p>
        </div>
      </section>

      <div className="shop-page__body">
        <div className="shop-page__filters">
          <div className="shop-page__filters-grid">
            <input
              type="search"
              placeholder={t('boutiques_page.search_placeholder')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="shop-page__input"
            />
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="shop-page__select"
            >
              <option value="">{t('boutiques_page.all_ratings')}</option>
              <option value="5">{t('boutiques_page.rating_5')}</option>
              <option value="4">{t('boutiques_page.rating_4')}</option>
              <option value="3">{t('boutiques_page.rating_3')}</option>
            </select>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="shop-page__select"
            >
              <option value="">{t('boutiques_page.all_cities')}</option>
              {CITY_SLUGS.map((slug) => (
                <option key={slug} value={slug}>
                  {t(`cities.${slug}.name`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="shop-page__loading">
            <div className="shop-page__spinner" />
            <p>{t('boutiques_page.loading')}</p>
          </div>
        ) : boutiques?.length > 0 ? (
          <>
            <div className="shop-page__grid">
              {boutiques.map((boutique) => (
                <BoutiqueCard
                  key={boutique.id}
                  boutique={boutique}
                  onFollow={handleFollow}
                  isFollowing={following[boutique.id] || false}
                  showDelivery
                />
              ))}
            </div>

            <div className="shop-page__pagination">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="shop-page__page-btn"
              >
                {t('boutiques_page.prev')}
              </button>
              <span className="shop-page__page-num">{page}</span>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                className="shop-page__page-btn"
              >
                {t('boutiques_page.next')}
              </button>
            </div>
          </>
        ) : (
          <p className="shop-page__empty">{t('boutiques_page.empty')}</p>
        )}
      </div>
    </div>
  );
};
