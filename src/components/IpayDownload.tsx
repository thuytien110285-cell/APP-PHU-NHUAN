import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import contentData from '../data/contentData.json';

interface IpayDownloadProps {
  onBackToMenu: () => void;
}

export const IpayDownload: React.FC<IpayDownloadProps> = ({ onBackToMenu }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <button
        type="button"
        onClick={onBackToMenu}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#003B73] hover:text-[#002855] mb-3 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại menu chính</span>
      </button>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-balance">
          {contentData.ipayDownload.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1.5 max-w-2xl">
          {contentData.ipayDownload.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {contentData.ipayDownload.platforms.map((platform) => {
          const isIos = platform.id === 'ios';
          const isCopied = copiedId === platform.id;

          return (
            <div
              key={platform.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between gap-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#003B73]">
                    {platform.storeName}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    {platform.name}
                  </h2>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {platform.description}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-slate-100 text-[#003B73] flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
              </div>

              {/* Scannable QR Code for Counter Kiosk */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/70 flex flex-col sm:flex-row items-center gap-5">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shrink-0">
                  <QRCodeSVG
                    value={platform.url}
                    size={132}
                    bgColor="#FFFFFF"
                    fgColor="#002855"
                    level="M"
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <p className="text-sm font-bold text-slate-900">
                    Quét mã QR bằng camera điện thoại
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Hướng camera điện thoại {isIos ? 'iPhone' : 'Android'} vào mã QR để mở trực tiếp trang cài đặt chính thức của VietinBank.
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 break-all">
                    {platform.url}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#003B73] hover:bg-[#002855] text-white text-sm font-semibold whitespace-nowrap transition-colors"
                >
                  <span>{platform.buttonLabel}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => handleCopyLink(platform.id, platform.url)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 min-h-[44px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao chép link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Benefits Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-4">
          <ShieldCheck className="w-5 h-5 text-[#003B73]" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Tiện ích nổi bật trên VietinBank iPay
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contentData.ipayDownload.benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed"
            >
              <span className="font-mono-num font-bold text-[#003B73] mr-2">
                0{idx + 1}.
              </span>
              {benefit}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
