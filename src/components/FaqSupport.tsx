import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  KeyRound,
  CreditCard,
  ScanFace,
  ReceiptText,
  CalendarClock,
  PhoneCall,
  PlayCircle,
  MessageSquareOff,
  X,
  ListOrdered,
  Layers,
} from 'lucide-react';
import contentData from '../data/contentData.json';
import { SafeImage } from './SafeImage';

interface FaqSupportProps {
  onBackToMenu: () => void;
  onEndConversation: () => void;
}

const GUIDE_ICONS: Record<string, React.ReactNode> = {
  'forgot-password': <KeyRound className="w-5 h-5" />,
  'close-card': <CreditCard className="w-5 h-5" />,
  'biometric-cccd': <ScanFace className="w-5 h-5" />,
  'e-tax': <ReceiptText className="w-5 h-5" />,
  'appointment-booking': <CalendarClock className="w-5 h-5" />,
};

export const FaqSupport: React.FC<FaqSupportProps> = ({
  onBackToMenu,
  onEndConversation,
}) => {
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'stepper' | 'all'>('stepper');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [feedbackState, setFeedbackState] = useState<'none' | 'not_okay'>('none');
  const [zoomedImage, setZoomedImage] = useState<{ url: string; caption: string } | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const selectedGuide = contentData.faqSection.guides.find(
    (g) => g.id === selectedGuideId
  );

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.faq-animate', {
        y: 14,
        opacity: 0,
        duration: 0.35,
        stagger: 0.05,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [selectedGuideId]);

  const handleSelectGuide = (id: string) => {
    setSelectedGuideId(id);
    setCurrentStepIdx(0);
    setFeedbackState('none');
    setViewMode('stepper');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToFaqList = () => {
    setSelectedGuideId(null);
    setFeedbackState('none');
  };

  if (!selectedGuide) {
    return (
      <div ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="faq-animate flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              type="button"
              onClick={onBackToMenu}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#003B73] hover:text-[#002855] mb-3 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{contentData.faqSection.btnBackMenu}</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-balance">
              {contentData.faqSection.questionPrompt}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1.5 max-w-2xl">
              {contentData.faqSection.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onEndConversation}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer self-start"
          >
            <MessageSquareOff className="w-4 h-4 text-[#D71920]" />
            <span>{contentData.faqSection.btnEndChat}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {contentData.faqSection.guides.map((guide, index) => (
            <button
              key={guide.id}
              type="button"
              onClick={() => handleSelectGuide(guide.id)}
              className="faq-animate group text-left bg-white rounded-2xl border border-slate-200/90 hover:border-[#003B73]/50 hover:shadow-md p-6 transition-all duration-200 flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B73]"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#003B73]/8 text-[#003B73] group-hover:bg-[#003B73] group-hover:text-white flex items-center justify-center transition-colors">
                    {GUIDE_ICONS[guide.id] || <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {guide.tag} · {guide.steps.length} bước
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#003B73] transition-colors leading-snug">
                  {index + 1}. {guide.title}
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {guide.summary}
                </p>
              </div>
              <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-[#003B73]">
                <span>Xem hướng dẫn chi tiết</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentStep = selectedGuide.steps[currentStepIdx];
  const totalSteps = selectedGuide.steps.length;

  return (
    <div ref={sectionRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Top Action Row */}
      <div className="faq-animate flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={handleBackToFaqList}
          className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-sm font-semibold text-[#003B73] hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Chọn nội dung khác</span>
        </button>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('stepper')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'stepper'
                ? 'bg-white text-[#003B73] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Từng bước</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'all'
                ? 'bg-white text-[#003B73] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Tất cả ({totalSteps})</span>
          </button>
        </div>
      </div>

      {/* Guide Header */}
      <div className="faq-animate bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 mb-6">
        <p className="text-xs font-semibold text-[#003B73] mb-1.5">
          {selectedGuide.tag} · {totalSteps} bước thực hiện
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-balance">
          {selectedGuide.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2">{selectedGuide.summary}</p>
      </div>

      {/* Step-by-Step Interactive Mode */}
      {viewMode === 'stepper' ? (
        <div className="faq-animate bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 mb-6">
          {/* Step Progress Bar */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <span className="text-sm font-bold text-[#003B73] font-mono-num">
              Bước {currentStep.stepNumber} / {totalSteps}
            </span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#003B73] transition-all duration-300 rounded-full"
                style={{ width: `${((currentStepIdx + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 flex justify-center bg-slate-50 rounded-xl p-4 border border-slate-200/70">
              <SafeImage
                src={currentStep.imageUrl}
                alt={`Bước ${currentStep.stepNumber}: ${currentStep.text}`}
                fallbackTitle={`Hình minh họa Bước ${currentStep.stepNumber}`}
                aspectClassName="w-full max-w-[260px] aspect-[9/16] rounded-lg"
                className="w-full h-full object-contain"
                onClick={() =>
                  setZoomedImage({
                    url: currentStep.imageUrl,
                    caption: `Bước ${currentStep.stepNumber}: ${currentStep.text}`,
                  })
                }
              />
            </div>

            <div className="md:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#003B73] text-white font-bold text-sm font-mono-num mb-3">
                  {currentStep.stepNumber}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  Bước {currentStep.stepNumber}
                </h2>
                <p className="text-base sm:text-lg text-slate-700 mt-3 leading-relaxed">
                  {currentStep.text}
                </p>
                <p className="text-xs text-slate-500 mt-3">
                  Chạm vào hình ảnh để phóng to xem chi tiết giao diện trên điện thoại.
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentStepIdx === 0}
                  onClick={() => setCurrentStepIdx((i) => Math.max(0, i - 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Bước trước</span>
                </button>

                <button
                  type="button"
                  disabled={currentStepIdx === totalSteps - 1}
                  onClick={() => setCurrentStepIdx((i) => Math.min(totalSteps - 1, i + 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#003B73] hover:bg-[#002855] text-white text-sm font-semibold disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>Bước tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick step selector dots */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-1.5">
            {selectedGuide.steps.map((s, idx) => (
              <button
                key={s.stepNumber}
                type="button"
                onClick={() => setCurrentStepIdx(idx)}
                className={`w-9 h-9 rounded-lg text-xs font-bold font-mono-num transition-colors cursor-pointer ${
                  idx === currentStepIdx
                    ? 'bg-[#003B73] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.stepNumber}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* All Steps List Mode */
        <div className="space-y-4 mb-6">
          {selectedGuide.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center"
            >
              <div className="sm:col-span-4 flex justify-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                <SafeImage
                  src={step.imageUrl}
                  alt={`Bước ${step.stepNumber}: ${step.text}`}
                  fallbackTitle={`Bước ${step.stepNumber}`}
                  aspectClassName="w-full max-w-[190px] aspect-[9/16] rounded-lg"
                  className="w-full h-full object-contain"
                  onClick={() =>
                    setZoomedImage({
                      url: step.imageUrl,
                      caption: `Bước ${step.stepNumber}: ${step.text}`,
                    })
                  }
                />
              </div>
              <div className="sm:col-span-8 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#003B73] font-mono-num">
                  Bước {step.stepNumber} / {totalSteps}
                </span>
                <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* YouTube Video Link if available */}
      {selectedGuide.videoUrl && (
        <div className="faq-animate bg-white rounded-2xl border border-slate-200/90 p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#D71920] flex items-center justify-center shrink-0">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Video minh họa thao tác trực quan
              </h3>
              <p className="text-sm text-slate-600 mt-0.5">
                Mở ứng dụng YouTube để xem video hướng dẫn chi tiết cho mục này.
              </p>
            </div>
          </div>
          <a
            href={selectedGuide.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#D71920] hover:bg-[#B8141A] text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{contentData.faqSection.btnWatchVideo}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Customer Resolution Check & Session Controls */}
      <div className="faq-animate bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">
          {contentData.faqSection.checkPrompt}
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Vui lòng xác nhận để tiếp tục tra cứu nội dung khác hoặc kết nối trực tiếp với chuyên viên tư vấn tại quầy.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBackToMenu}
            className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#003B73] hover:bg-[#002855] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{contentData.faqSection.btnOkay}</span>
          </button>

          <button
            type="button"
            onClick={() => setFeedbackState('not_okay')}
            className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors cursor-pointer"
          >
            <span>{contentData.faqSection.btnNotOkay}</span>
          </button>
        </div>

        {feedbackState === 'not_okay' && (
          <div className="mt-5 p-5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3">
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
              “{contentData.brand.feedbackNotOkayMessage}”
            </p>
            <a
              href={`tel:${contentData.brand.advisor.phoneRaw}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-[#D71920] hover:bg-[#B8141A] text-white text-sm font-semibold transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Gọi ngay: {contentData.brand.advisor.phoneDisplay}</span>
            </a>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToMenu}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{contentData.faqSection.btnBackMenu}</span>
          </button>

          <button
            type="button"
            onClick={onEndConversation}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100/80 text-[#D71920] text-sm font-semibold transition-colors cursor-pointer"
          >
            <MessageSquareOff className="w-4 h-4" />
            <span>{contentData.faqSection.btnEndChat}</span>
          </button>
        </div>
      </div>

      {/* Image Zoom Lightbox */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 space-y-3 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800 line-clamp-2">
                {zoomedImage.caption}
              </p>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 cursor-pointer"
                aria-label="Đóng ảnh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 flex justify-center max-h-[75vh] overflow-auto">
              <img
                src={zoomedImage.url}
                alt={zoomedImage.caption}
                referrerPolicy="no-referrer"
                className="max-h-[68vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
