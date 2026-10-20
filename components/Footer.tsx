// components/Footer.tsx
'use client';

import React from 'react';
import { T, GENRE_NAMES } from '@/lib/i18n';
import { LangCode } from '@/types';

interface FooterProps {
  lang: LangCode;
  onTabChange: (tab: 'home' | 'search' | 'favorites') => void;
  onSelectGenre: (genreId: string) => void;
}

export default function Footer({ lang, onTabChange, onSelectGenre }: FooterProps) {
  const t = T[lang] || T.ar;
  const popularGenreIds = [28, 18, 35, 27]; // Action, Drama, Comedy, Horror

  return (
    <footer className="bg-[#0e1017] border-t border-white/10 mt-16 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        {/* Responsive 4 / 2 / 1 Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Column 1: About Falak */}
          <div className="flex flex-col">
            <h4 className="font-extrabold text-white text-sm mb-3.5 tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
              {t.footer_about}
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t.footer_about_text}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col">
            <h4 className="font-extrabold text-white text-sm mb-3.5 tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
              {t.footer_links}
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-400">
              <li>
                <button
                  type="button"
                  onClick={() => onTabChange('home')}
                  className="hover:text-red-500 transition-colors cursor-pointer text-start"
                >
                  {t.nav_home}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onTabChange('search')}
                  className="hover:text-red-500 transition-colors cursor-pointer text-start"
                >
                  {t.btn_search}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onTabChange('favorites')}
                  className="hover:text-red-500 transition-colors cursor-pointer text-start"
                >
                  {t.my_favorites}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: 4 Popular Genres */}
          <div className="flex flex-col">
            <h4 className="font-extrabold text-white text-sm mb-3.5 tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
              {t.footer_genres}
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-400">
              {popularGenreIds.map((id) => {
                const genreName = GENRE_NAMES[id]?.[lang] || GENRE_NAMES[id]?.ar || String(id);
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => onSelectGenre(String(id))}
                      className="hover:text-red-500 transition-colors cursor-pointer text-start"
                    >
                      {genreName}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 4: Legal Links */}
          <div className="flex flex-col">
            <h4 className="font-extrabold text-white text-sm mb-3.5 tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
              {t.footer_info}
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-400">
              <li>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="hover:text-red-500 transition-colors cursor-pointer"
                >
                  {t.footer_privacy}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="hover:text-red-500 transition-colors cursor-pointer"
                >
                  {t.footer_terms}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Full-Width Copyright Bar */}
        <div className="border-t border-white/5 pt-6 text-center text-[11px] text-gray-500">
          <p>{t.footer_copy}</p>
        </div>
      </div>
    </footer>
  );
}
