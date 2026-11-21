import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  MapPin,
  PhoneCall,
  Navigation,
} from 'lucide-react';
import contentData from '../data/contentData.json';
import { SafeImage } from './SafeImage';

interface BranchLocatorProps {
  onBackToMenu: () => void;
}

export const BranchLocator: React.FC<BranchLocatorProps> = ({
  onBackToMenu,
}) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    contentData.branchesSection.branchOptions[0].id
  );

  const visibleLocations = contentData.branchesSection.locations.filter(
    (loc) => loc.branchId === selectedBranchId
  );

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

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-balance">
            {contentData.branchesSection.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1.5 max-w-2xl">
            {contentData.branchesSection.subtitle}
          </p>
        </div>

        {/* Branch selector */}
        <div className="min-w-[200px]">
          <label
            htmlFor="branch-select"
            className="block text-xs font-semibold text-slate-500 mb-1"
          >
            Chi nhánh đang chọn
          </label>
          <select
            id="branch-select"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-300 bg-white text-sm font-bold text-[#003B73] focus:outline-none focus:ring-2 focus:ring-[#003B73]/20"
          >
            {contentData.branchesSection.branchOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleLocations.map((loc, idx) => (
          <article
            key={loc.id}
            className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="bg-slate-100 border-b border-slate-100">
                <SafeImage
                  src={loc.imageUrl}
                  alt={`${loc.name} - ${loc.branchName}`}
                  fallbackTitle={loc.name}
                  aspectClassName="w-full aspect-[16/9]"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-[#003B73] font-mono-num">
                    0{idx + 1} · {loc.branchName}
                  </p>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    {loc.name}
                  </h2>
                </div>

                {/* Address with Google Maps Icon right next to it per PDF 4 */}
                <div className="flex items-start justify-between gap-3 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <div className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                    <MapPin className="w-4 h-4 text-[#D71920] shrink-0 mt-1" />
                    <span>{loc.address}</span>
                  </div>
                  <a
                    href={loc.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Mở bản đồ Google Maps"
                    aria-label={`Chỉ đường Google Maps tới ${loc.name}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg bg-white border border-slate-200 hover:border-[#003B73] text-[#003B73] text-xs font-bold whitespace-nowrap shrink-0 shadow-2xs transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#D71920]" />
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-2.5 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-[#003B73] shrink-0 mt-0.5" />
                  <span>{loc.hours}</span>
                </div>
              </div>
            </div>

            {/* Clickable Hotline */}
            <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">
                  {contentData.brand.advisor.title}: {contentData.brand.advisor.name}
                </p>
                <p className="text-sm font-bold text-slate-900 font-mono-num">
                  {contentData.brand.advisor.phoneDisplay}
                </p>
              </div>
              <a
                href={`tel:${contentData.brand.advisor.phoneRaw}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#003B73] hover:bg-[#002855] text-white text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Gọi hotline ngay</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
