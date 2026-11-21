import React, { useState } from 'react';
import {
  CheckCircle2,
  Home,
  HelpCircle,
  PiggyBank,
  Gamepad2,
  MapPin,
  PhoneCall,
  RotateCcw,
} from 'lucide-react';
import contentData from './data/contentData.json';
import { Header, FeatureId } from './components/Header';
import { HomeHub } from './components/HomeHub';
import { FaqSupport } from './components/FaqSupport';
import { IpayDownload } from './components/IpayDownload';
import { GamesHub } from './components/GamesHub';
import { DepositCalculator } from './components/DepositCalculator';
import { LoanCalculator } from './components/LoanCalculator';
import { ProductsShowcase } from './components/ProductsShowcase';
import { BranchLocator } from './components/BranchLocator';

export default function App() {
  const [activeFeature, setActiveFeature] = useState<FeatureId>('home');
  const [sessionEnded, setSessionEnded] = useState<boolean>(false);

  const navigateTo = (id: FeatureId) => {
    setSessionEnded(false);
    setActiveFeature(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEndSession = () => {
    setSessionEnded(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestartSession = () => {
    setSessionEnded(false);
    setActiveFeature('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-slate-900">
      <Header
        activeFeature={activeFeature}
        onNavigate={navigateTo}
        onEndSession={handleEndSession}
      />

      <main className="flex-1 pb-20 lg:pb-8">
        {sessionEnded ? (
          <div className="max-w-xl mx-auto px-4 py-16 sm:py-24">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-10 text-center space-y-5 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#003B73]">
                  {contentData.brand.name} · {contentData.brand.branchName}
                </p>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug text-balance">
                  {contentData.brand.endConversationMessage}
                </h1>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRestartSession}
                  className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#003B73] hover:bg-[#002855] text-white text-sm font-semibold cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Quay lại menu chính</span>
                </button>
                <a
                  href={`tel:${contentData.brand.advisor.phoneRaw}`}
                  className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-[#D71920]" />
                  <span>Liên hệ {contentData.brand.advisor.phoneDisplay}</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeFeature === 'home' && <HomeHub onSelectFeature={navigateTo} />}
            {activeFeature === 'faq' && (
              <FaqSupport
                onBackToMenu={() => navigateTo('home')}
                onEndConversation={handleEndSession}
              />
            )}
            {activeFeature === 'ipay' && (
              <IpayDownload onBackToMenu={() => navigateTo('home')} />
            )}
            {activeFeature === 'game' && (
              <GamesHub onBackToMenu={() => navigateTo('home')} />
            )}
            {activeFeature === 'deposit' && (
              <DepositCalculator onBackToMenu={() => navigateTo('home')} />
            )}
            {activeFeature === 'loan' && (
              <LoanCalculator onBackToMenu={() => navigateTo('home')} />
            )}
            {activeFeature === 'products' && (
              <ProductsShowcase onBackToMenu={() => navigateTo('home')} />
            )}
            {activeFeature === 'branches' && (
              <BranchLocator onBackToMenu={() => navigateTo('home')} />
            )}
          </>
        )}
      </main>

      {/* Clean Institutional Footer */}
      <footer className="hidden lg:block border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#003B73]">
              {contentData.brand.name} · {contentData.brand.branchName}
            </span>
            <span aria-hidden="true">·</span>
            <span>Cổng tương tác khách hàng tại quầy giao dịch</span>
          </div>
          <div className="flex items-center gap-4">
            <span>
              {contentData.brand.advisor.title}: {contentData.brand.advisor.name}
            </span>
            <span aria-hidden="true">·</span>
            <a
              href={`tel:${contentData.brand.advisor.phoneRaw}`}
              className="font-semibold text-[#003B73] hover:underline font-mono-num"
            >
              {contentData.brand.advisor.phoneDisplay}
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Compact Bottom Tab Bar (Thumb-Zone Ergonomics, <= 64px height) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200"
        aria-label="Thanh công cụ nhanh trên di động"
      >
        <div className="grid grid-cols-5 h-16 items-center">
          {[
            { id: 'home' as FeatureId, label: 'Trang chủ', icon: <Home className="w-5 h-5" /> },
            { id: 'faq' as FeatureId, label: 'Giải đáp', icon: <HelpCircle className="w-5 h-5" /> },
            { id: 'deposit' as FeatureId, label: 'Tính lãi', icon: <PiggyBank className="w-5 h-5" /> },
            { id: 'game' as FeatureId, label: 'Mini Game', icon: <Gamepad2 className="w-5 h-5" /> },
            { id: 'branches' as FeatureId, label: 'Chi nhánh', icon: <MapPin className="w-5 h-5" /> },
          ].map((tab) => {
            const active = !sessionEnded && activeFeature === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigateTo(tab.id)}
                className={`flex flex-col items-center justify-center h-full gap-1 transition-colors cursor-pointer ${
                  active ? 'text-[#D71920] font-bold' : 'text-slate-600'
                }`}
              >
                {tab.icon}
                <span className="text-[10px] leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
