import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  PhoneCall,
  CheckCircle2,
  X,
} from 'lucide-react';
import contentData from '../data/contentData.json';
import { SafeImage } from './SafeImage';

interface ProductsShowcaseProps {
  onBackToMenu: () => void;
}

export const ProductsShowcase: React.FC<ProductsShowcaseProps> = ({
  onBackToMenu,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [interestedProductTitle, setInterestedProductTitle] = useState<string | null>(
    null
  );
  const carouselRef = useRef<HTMLDivElement>(null);

  const filteredItems =
    activeCategory === 'all'
      ? contentData.productsSection.items
      : contentData.productsSection.items.filter(
          (item) => item.category === activeCategory
        );

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setActiveSlideIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const scrollToSlide = (idx: number) => {
    const clamped = Math.max(0, Math.min(filteredItems.length - 1, idx));
    setActiveSlideIndex(clamped);
    if (carouselRef.current) {
      const child = carouselRef.current.children[clamped] as HTMLElement | undefined;
      if (child) {
        child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <button
        type="button"
        onClick={onBackToMenu}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#003B73] hover:text-[#002855] mb-3 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại menu chính</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-balance">
            {contentData.productsSection.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1.5 max-w-2xl">
            {contentData.productsSection.subtitle}
          </p>
        </div>

        {/* Carousel prev/next controls */}
        {filteredItems.length > 1 && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => scrollToSlide(activeSlideIndex - 1)}
              disabled={activeSlideIndex === 0}
              className="w-11 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 disabled:opacity-40 cursor-pointer"
              aria-label="Sản phẩm trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold font-mono-num text-slate-600 px-2">
              {activeSlideIndex + 1} / {filteredItems.length}
            </span>
            <button
              type="button"
              onClick={() => scrollToSlide(activeSlideIndex + 1)}
              disabled={activeSlideIndex === filteredItems.length - 1}
              className="w-11 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 disabled:opacity-40 cursor-pointer"
              aria-label="Sản phẩm tiếp theo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Category Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-6">
        {contentData.productsSection.categories.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2.5 min-h-[42px] rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                active
                  ? 'bg-[#003B73] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4"
      >
        {filteredItems.map((item, idx) => (
          <article
            key={item.id}
            onMouseEnter={() => setActiveSlideIndex(idx)}
            className="snap-center shrink-0 w-[88%] sm:w-[440px] lg:w-[420px] bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md"
          >
            <div>
              <div className="bg-slate-50 border-b border-slate-100 p-3">
                <SafeImage
                  src={item.imageUrl}
                  alt={item.title}
                  fallbackTitle={item.title}
                  aspectClassName="w-full aspect-[4/3] rounded-xl"
                  className="w-full h-full object-contain bg-white"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold text-[#003B73] mb-1.5">
                  {item.categoryLabel}
                </p>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {item.title}
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2">
              <button
                type="button"
                onClick={() => setInterestedProductTitle(item.title)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[46px] rounded-xl bg-[#D71920] hover:bg-[#B8141A] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Tôi quan tâm</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Slide Indicator Dots */}
      {filteredItems.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {filteredItems.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSlide(idx)}
              aria-label={`Xem ${item.title}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === activeSlideIndex
                  ? 'w-7 bg-[#003B73]'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal when customer clicks "Tôi quan tâm" */}
      {interestedProductTitle && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInterestedProductTitle(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setInterestedProductTitle(null)}
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#003B73]">
                Sản phẩm: {interestedProductTitle}
              </p>
              <h2 className="text-lg font-bold text-slate-900">
                {contentData.productsSection.interestSuccessTitle}
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {contentData.productsSection.interestSuccessBody}
              </p>
              <p className="text-sm font-semibold text-[#003B73] pt-1">
                {contentData.productsSection.interestAdvisorLine}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`tel:${contentData.brand.advisor.phoneRaw}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-[#003B73] hover:bg-[#002855] text-white text-sm font-semibold whitespace-nowrap transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Gọi {contentData.brand.advisor.phoneDisplay}</span>
              </a>
              <button
                type="button"
                onClick={() => setInterestedProductTitle(null)}
                className="px-4 py-3 min-h-[44px] rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
