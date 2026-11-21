import React, { useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  PlayCircle,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import contentData from '../data/contentData.json';

interface DepositCalculatorProps {
  onBackToMenu: () => void;
}

const formatVnd = (value: number): string =>
  Math.round(value).toLocaleString('vi-VN');

export const DepositCalculator: React.FC<DepositCalculatorProps> = ({
  onBackToMenu,
}) => {
  const [amountInput, setAmountInput] = useState<string>('100000000');
  const [selectedMonths, setSelectedMonths] = useState<string>('12');
  const [rateInput, setRateInput] = useState<string>('4.7');

  // Parse numeric values safely
  const parsedAmount = amountInput.trim() === '' ? NaN : Number(amountInput);
  const parsedMonths = selectedMonths === '' ? NaN : Number(selectedMonths);
  const parsedRate = rateInput.trim() === '' ? NaN : Number(rateInput);

  // Validation checks strictly matching PDF 2 rules
  const amountError =
    amountInput.trim() === '' || Number.isNaN(parsedAmount) || parsedAmount <= 0
      ? contentData.depositCalculator.errors.invalidAmount
      : null;

  const amountWarning =
    !amountError && parsedAmount < contentData.depositCalculator.minDeposit
      ? contentData.depositCalculator.errors.belowMinimum
      : null;

  const termError =
    selectedMonths === '' ||
    Number.isNaN(parsedMonths) ||
    !contentData.depositCalculator.terms.some((t) => t.months === parsedMonths)
      ? contentData.depositCalculator.errors.invalidTerm
      : null;

  const rateError =
    rateInput.trim() === '' ||
    Number.isNaN(parsedRate) ||
    parsedRate < 0 ||
    parsedRate > contentData.depositCalculator.maxInterestRate
      ? contentData.depositCalculator.errors.invalidRate
      : null;

  const isValid = !amountError && !termError && !rateError;

  const interestAmount = isValid
    ? Math.round(parsedAmount * (parsedRate / 100) * (parsedMonths / 12))
    : 0;
  const totalAmount = isValid ? Math.round(parsedAmount + interestAmount) : 0;

  const principalShare =
    totalAmount > 0 ? (parsedAmount / totalAmount) * 100 : 100;
  const interestShare = totalAmount > 0 ? (interestAmount / totalAmount) * 100 : 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip any non-digit characters immediately
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setAmountInput(digitsOnly);
  };

  const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedMonths(val);
    const matched = contentData.depositCalculator.terms.find(
      (t) => String(t.months) === val
    );
    if (matched) {
      setRateInput(String(matched.suggestedRate));
    }
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow valid decimal numbers only
    const val = e.target.value.replace(',', '.');
    if (/^\d*\.?\d*$/.test(val)) {
      setRateInput(val);
    }
  };

  const handleReset = () => {
    setAmountInput('100000000');
    setSelectedMonths('12');
    setRateInput('4.7');
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

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-balance">
            {contentData.depositCalculator.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1.5 max-w-3xl">
            {contentData.depositCalculator.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer self-start"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Đặt lại mặc định</span>
        </button>
      </div>

      {/* Main Split Calculator Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">
        {/* Left: Tiền gửi dự tính */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-5">
          <h2 className="text-base font-bold text-[#003B73] border-b border-slate-100 pb-3">
            Tiền gửi dự tính
          </h2>

          {/* Số tiền gửi */}
          <div>
            <label
              htmlFor="deposit-amount"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              Tổng tiền gửi
            </label>
            <div className="relative">
              <input
                id="deposit-amount"
                type="text"
                inputMode="numeric"
                value={
                  amountInput
                    ? Number(amountInput).toLocaleString('vi-VN')
                    : ''
                }
                onChange={handleAmountChange}
                placeholder="Nhập số tiền gửi (VD: 100.000.000)"
                className={`w-full pr-16 pl-4 py-3 min-h-[48px] rounded-xl border text-base font-semibold font-mono-num text-slate-900 focus:outline-none focus:ring-2 transition-colors ${
                  amountError
                    ? 'border-[#D71920] focus:ring-[#D71920]/20 bg-red-50/30'
                    : 'border-slate-300 focus:border-[#003B73] focus:ring-[#003B73]/20'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                VND
              </span>
            </div>
            {amountError && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#D71920]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{amountError}</span>
              </p>
            )}
            {amountWarning && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-700">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{amountWarning}</span>
              </p>
            )}
          </div>

          {/* Kỳ hạn gửi */}
          <div>
            <label
              htmlFor="deposit-term"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              Kỳ hạn (Tháng)
            </label>
            <select
              id="deposit-term"
              value={selectedMonths}
              onChange={handleTermChange}
              className={`w-full px-4 py-3 min-h-[48px] rounded-xl border text-base font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 transition-colors ${
                termError
                  ? 'border-[#D71920] focus:ring-[#D71920]/20'
                  : 'border-slate-300 focus:border-[#003B73] focus:ring-[#003B73]/20'
              }`}
            >
              <option value="">Chọn kỳ hạn</option>
              {contentData.depositCalculator.terms.map((term) => (
                <option key={term.months} value={String(term.months)}>
                  {term.label} (Tham khảo: {term.suggestedRate}%/năm)
                </option>
              ))}
            </select>
            {termError && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#D71920]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{termError}</span>
              </p>
            )}
          </div>

          {/* Lãi suất */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="deposit-rate"
                className="block text-sm font-semibold text-slate-800"
              >
                Lãi suất
              </label>
              <span className="text-xs text-slate-500">
                Trần kiểm tra: ≤ {contentData.depositCalculator.maxInterestRate}%/năm
              </span>
            </div>
            <div className="relative">
              <input
                id="deposit-rate"
                type="text"
                inputMode="decimal"
                value={rateInput}
                onChange={handleRateChange}
                placeholder="0"
                className={`w-full pr-20 pl-4 py-3 min-h-[48px] rounded-xl border text-base font-semibold font-mono-num text-slate-900 focus:outline-none focus:ring-2 transition-colors ${
                  rateError
                    ? 'border-[#D71920] focus:ring-[#D71920]/20 bg-red-50/30'
                    : 'border-slate-300 focus:border-[#003B73] focus:ring-[#003B73]/20'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                %/năm
              </span>
            </div>
            {rateError && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#D71920]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{rateError}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right: Tiền lãi dự tính */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#F0F6FC] to-white rounded-2xl border border-blue-200/80 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <h2 className="text-base font-bold text-[#003B73] border-b border-blue-200/60 pb-3">
              Tiền lãi dự tính
            </h2>

            <div className="bg-white rounded-xl border border-slate-200/80 p-5">
              <p className="text-xs font-medium text-slate-500 mb-1">
                Số tiền lãi nhận được cuối kỳ
              </p>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#003B73] font-mono-num">
                  {formatVnd(interestAmount)}
                </span>
                <span className="text-sm font-bold text-slate-500">VND</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-5">
              <p className="text-xs font-medium text-slate-500 mb-1">
                Tổng tiền (Gốc + Lãi)
              </p>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono-num">
                  {formatVnd(totalAmount)}
                </span>
                <span className="text-sm font-bold text-slate-500">VND</span>
              </div>
            </div>

            {/* Visual Proportion Bar */}
            {isValid && totalAmount > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                  <span>Tiền gốc: {principalShare.toFixed(1)}%</span>
                  <span className="text-[#003B73] font-semibold">
                    Tiền lãi: {interestShare.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
                  <div
                    className="bg-slate-700 h-full transition-all duration-300"
                    style={{ width: `${principalShare}%` }}
                  />
                  <div
                    className="bg-[#D71920] h-full transition-all duration-300"
                    style={{ width: `${interestShare}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-blue-200/50">
            Công thức áp dụng: Tiền lãi = Số tiền gửi × (Lãi suất %/năm / 12) × Số tháng gửi. Kết quả mang tính chất tham khảo theo biểu lãi suất tại thời điểm giao dịch.
          </p>
        </div>
      </div>

      {/* TikTok Video Guide Link from PDF 2 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {contentData.depositCalculator.videoGuide.label}
            </h3>
            <p className="text-sm text-slate-600 mt-0.5">
              {contentData.depositCalculator.videoGuide.description}
            </p>
          </div>
        </div>
        <a
          href={contentData.depositCalculator.videoGuide.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors"
        >
          <span>Xem video hướng dẫn</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
