import React, { useState } from 'react';
import { PhoneCall } from 'lucide-react';
import contentData from '../data/contentData.json';

export type FeatureId =
  | 'home'
  | 'faq'
  | 'ipay'
  | 'game'
  | 'deposit'
  | 'loan'
  | 'products'
  | 'branches';

interface HeaderProps {
  activeFeature: FeatureId;
  onNavigate: (id: FeatureId) => void;
  onEndSession: () => void;
}

const TOP_NAV_ITEMS: { id: FeatureId; label: string }[] = [
  { id: 'home', label: 'Trang chủ' },
  { id: 'faq', label: 'Giải đáp' },
  { id: 'deposit', label: 'Tính lãi & Vay' },
  { id: 'products', label: 'Sản phẩm' },
  { id: 'branches', label: 'Điểm giao dịch' },
];

export const Header: React.FC<HeaderProps> = ({
  activeFeature,
  onNavigate,
  onEndSession,
}) => {
  const [logoError, setLogoError] = useState(false);

  const isNavActive = (itemId: FeatureId) => {
    if (itemId === 'deposit') {
      return activeFeature === 'deposit' || activeFeature === 'loan';
    }
    return activeFeature === itemId;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark / Logo on the left */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B73] rounded-lg py-1"
          aria-label="VietinBank Chi nhánh 2 TP.HCM - Trang chủ"
        >
          {!logoError ? (
            <img
              src={contentData.brand.logoUrl}
              alt={`${contentData.brand.name} ${contentData.brand.branchName}`}
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
              className="h-9 sm:h-10 w-auto object-contain"
            />
          ) : (
            <span className="text-lg font-extrabold tracking-tight text-[#003B73] font-display">
              VietinBank CN2
            </span>
          )}
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Điều hướng chính">
          {TOP_NAV_ITEMS.map((item) => {
            const active = isNavActive(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B73] rounded ${
                  active
                    ? 'text-[#003B73] font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D71920] rounded-full"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={`tel:${contentData.brand.advisor.phoneRaw}`}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg bg-[#003B73] hover:bg-[#002855] text-white text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#003B73]"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Hỗ trợ: {contentData.brand.advisor.phoneDisplay}</span>
          </a>
        </div>
      </div>

      {/* Contextual sub-bar when inside a specific tool for instant switching across all 7 modules */}
      {activeFeature !== 'home' && (
        <div className="border-t border-slate-100 bg-slate-50/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-1.5 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5">
              {contentData.navigation.map((nav) => {
                const isActive = activeFeature === nav.id;
                return (
                  <button
                    key={nav.id}
                    type="button"
                    onClick={() => onNavigate(nav.id as FeatureId)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 ${
                      isActive
                        ? 'bg-white text-[#003B73] shadow-xs border border-slate-200 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {nav.shortLabel}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={onEndSession}
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-[#D71920] hover:bg-red-50 whitespace-nowrap shrink-0 transition-colors"
            >
              Kết thúc phiên
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
