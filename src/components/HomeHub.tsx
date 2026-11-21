import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  HelpCircle,
  Smartphone,
  Gamepad2,
  PiggyBank,
  Calculator,
  Star,
  MapPin,
  ArrowRight,
  PhoneCall,
} from 'lucide-react';
import contentData from '../data/contentData.json';
import { FeatureId } from './Header';

interface HomeHubProps {
  onSelectFeature: (id: FeatureId) => void;
}

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  faq: <HelpCircle className="w-5 h-5" />,
  ipay: <Smartphone className="w-5 h-5" />,
  game: <Gamepad2 className="w-5 h-5" />,
  deposit: <PiggyBank className="w-5 h-5" />,
  loan: <Calculator className="w-5 h-5" />,
  products: <Star className="w-5 h-5" />,
  branches: <MapPin className="w-5 h-5" />,
};

export const HomeHub: React.FC<HomeHubProps> = ({ onSelectFeature }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-animate', {
        y: 16,
        opacity: 0,
        duration: 0.45,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      });
      gsap.from('.feature-card', {
        y: 18,
        opacity: 0,
        duration: 0.45,
        stagger: 0.05,
        delay: 0.12,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Executive Welcome Section */}
      <section className="mb-10 sm:mb-12">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <p className="hero-animate text-xs font-semibold uppercase tracking-wider text-[#003B73]">
              {contentData.brand.name} · {contentData.brand.branchName}
            </p>
            <h1 className="hero-animate text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
              {contentData.brand.portalTitle}
            </h1>
            <p className="hero-animate text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              {contentData.brand.portalSubtitle}
            </p>
            <div className="hero-animate pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectFeature('faq')}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#D71920] hover:bg-[#B8141A] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                <span>Giải đáp thắc mắc ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onSelectFeature('game')}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-900 text-sm font-semibold transition-colors cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4 text-[#003B73]" />
                <span>Chơi game nhận voucher</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-gradient-to-br from-[#003B73] to-[#002855] rounded-xl p-6 text-white flex flex-col justify-between space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-medium text-blue-200">
                Hỗ trợ trực tiếp tại quầy
              </p>
              <h2 className="text-lg font-bold leading-snug">
                {contentData.brand.officeName}
              </h2>
              <p className="text-sm text-blue-100/90 leading-relaxed">
                {contentData.brand.advisor.supportDescription}
              </p>
            </div>
            <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-blue-200">Hotline tư vấn</p>
                <p className="text-base font-bold font-mono-num">
                  {contentData.brand.advisor.phoneDisplay}
                </p>
              </div>
              <a
                href={`tel:${contentData.brand.advisor.phoneRaw}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-lg bg-white text-[#003B73] text-xs font-bold hover:bg-blue-50 transition-colors whitespace-nowrap shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Gọi ngay</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7 Interactive Counter Modules Grid */}
      <section aria-labelledby="modules-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h2 id="modules-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
              7 tiện ích tương tác dành cho Quý khách
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Chạm vào bất kỳ dịch vụ nào bên dưới để bắt đầu thao tác.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {contentData.homeFeatures.map((feature, idx) => {
            const isFeatured = Boolean((feature as { featured?: boolean }).featured);
            const isGameHighlight = Boolean((feature as { highlight?: boolean }).highlight);

            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => onSelectFeature(feature.id as FeatureId)}
                className={`feature-card group text-left rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between min-h-[210px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B73] ${
                  isFeatured
                    ? 'bg-gradient-to-br from-blue-50/90 via-white to-red-50/40 border border-[#D71920]/40 hover:border-[#D71920] hover:shadow-md'
                    : isGameHighlight
                    ? 'bg-gradient-to-br from-white via-white to-amber-50/60 border border-slate-200 hover:border-[#003B73]/50 hover:shadow-md'
                    : 'bg-white border border-slate-200/90 hover:border-[#003B73]/50 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                        isFeatured
                          ? 'bg-[#D71920] text-white'
                          : 'bg-[#003B73]/8 text-[#003B73] group-hover:bg-[#003B73] group-hover:text-white'
                      }`}
                    >
                      {FEATURE_ICONS[feature.id]}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 font-mono-num">
                      {isFeatured ? 'Nổi bật' : `0${idx + 1} · ${feature.category}`}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#003B73] transition-colors leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${
                      isFeatured ? 'text-[#D71920]' : 'text-[#003B73]'
                    }`}
                  >
                    {feature.actionLabel}
                  </span>
                  <ArrowRight
                    className={`w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 ${
                      isFeatured ? 'text-[#D71920]' : 'text-[#003B73]'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
