import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cityService } from '../services/cityService';
import { cityName } from '../utils/cityI18n';

export const HomePage = () => {
  const { t } = useTranslation();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await cityService.getCities();
        setCities(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/20 z-0" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10 text-center">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 text-text tracking-tight">
            L'Élégance <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Marocaine
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-neutral max-w-2xl mx-auto font-light">
            Découvrez une sélection exclusive des plus belles boutiques de mode et accessoires, mariant tradition et modernité.
          </p>
          <Link
            to="/boutiques"
            className="inline-flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-xl font-medium text-lg hover:bg-text transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1"
          >
            Explorer les collections
          </Link>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-text mb-2">Boutiques réputées</h2>
              <p className="text-neutral text-lg">Parcourez nos coups de cœur par ville</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {cities.slice(0, 4).map(city => (
                <Link
                  key={city.id}
                  to={`/boutiques?city=${city.slug}`}
                  className="group block relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  {city.image ? (
                    <img
                      src={city.image}
                      alt={cityName(t, city)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-accent/30 flex items-center justify-center">
                       <span className="text-4xl">🏙️</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-text/80 via-text/20 to-transparent group-hover:from-primary/90 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <h3 className="text-white text-3xl font-bold tracking-wide mb-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{cityName(t, city)}</h3>
                    <p className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 text-sm font-medium uppercase tracking-wider">
                      Découvrir →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white border-t border-accent/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold mb-16 text-text">L'Expérience FashionAura</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">
                ✨
              </div>
              <h3 className="text-xl font-bold text-text mb-3">Sélection Premium</h3>
              <p className="text-neutral font-light">Des créateurs et artisans rigoureusement choisis pour leur savoir-faire exceptionnel.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-secondary/20 text-text rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">
                🤝
              </div>
              <h3 className="text-xl font-bold text-text mb-3">Authenticité Garantie</h3>
              <p className="text-neutral font-light">Un lien direct avec les boutiques pour une expérience d'achat en toute confiance.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-accent/20 text-text rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">
                🛍️
              </div>
              <h3 className="text-xl font-bold text-text mb-3">Shopping Simplifié</h3>
              <p className="text-neutral font-light">Commandez facilement depuis n'importe où, avec un suivi clair de vos favoris.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
