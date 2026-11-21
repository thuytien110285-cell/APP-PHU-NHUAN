import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  Download,
  Eye,
  X,
  AlertCircle,
} from 'lucide-react';
import contentData from '../data/contentData.json';

interface LoanCalculatorProps {
  onBackToMenu: () => void;
}

interface ScheduleRow {
  stt: number;
  dateStr: string;
  remainingPrincipal: number;
  principal: number;
  interest: number;
  totalPayment: number;
}

const formatVnd = (n: number): string => Math.round(n).toLocaleString('vi-VN');

const roundToStep = (value: number, step: number): number => {
  if (step <= 1) return Math.round(value);
  return Math.round(value / step) * step;
};

const formatDateVn = (date: Date): string => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const addPeriodDate = (
  disbursementIso: string,
  periodIndex: number,
  monthsPerPeriod: number,
  repaymentDay: number
): string => {
  const parts = disbursementIso.split('-').map(Number);
  const year = parts[0] || 2026;
  const month = (parts[1] || 1) - 1;
  const day = parts[2] || 1;

  if (periodIndex === 0) {
    return formatDateVn(new Date(year, month, day));
  }

  // Advance by periodIndex * monthsPerPeriod months from disbursement date
  const targetTotalMonths = year * 12 + month + periodIndex * monthsPerPeriod;
  const targetYear = Math.floor(targetTotalMonths / 12);
  const targetMonth = targetTotalMonths % 12;
  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const clampedDay = Math.min(Math.max(1, repaymentDay), lastDayOfTargetMonth);
  return formatDateVn(new Date(targetYear, targetMonth, clampedDay));
};

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  onBackToMenu,
}) => {
  const defaults = contentData.loanCalculator.defaults;

  const [loanAmountStr, setLoanAmountStr] = useState<string>(
    String(defaults.loanAmount)
  );
  const [totalMonthsStr, setTotalMonthsStr] = useState<string>(
    String(defaults.totalMonths)
  );
  const [annualRateStr, setAnnualRateStr] = useState<string>(
    String(defaults.annualRate)
  );
  const [disbursementDate, setDisbursementDate] = useState<string>(
    defaults.disbursementDate
  );
  const [frequencyId, setFrequencyId] = useState<string>(defaults.frequency);
  const [repaymentDayStr, setRepaymentDayStr] = useState<string>(
    String(defaults.repaymentDay)
  );
  const [roundingId, setRoundingId] = useState<string>(defaults.rounding);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  const selectedFreq =
    contentData.loanCalculator.frequencies.find((f) => f.id === frequencyId) ||
    contentData.loanCalculator.frequencies[0];
  const selectedRounding =
    contentData.loanCalculator.roundingOptions.find((r) => r.id === roundingId) ||
    contentData.loanCalculator.roundingOptions[0];

  const loanAmount = Number(loanAmountStr) || 0;
  const totalMonths = Number(totalMonthsStr) || 0;
  const annualRate = Number(annualRateStr);
  const repaymentDay = Math.min(31, Math.max(1, Number(repaymentDayStr) || 25));

  const validationError = useMemo(() => {
    if (loanAmount <= 0) return 'Vui lòng nhập số tiền vay lớn hơn 0.';
    if (totalMonths < selectedFreq.monthsPerPeriod || totalMonths > 600) {
      return `Thời gian vay phải từ ${selectedFreq.monthsPerPeriod} đến 600 tháng.`;
    }
    if (Number.isNaN(annualRate) || annualRate < 0 || annualRate > 30) {
      return 'Vui lòng nhập lãi suất hợp lệ (0% - 30%/năm).';
    }
    if (!disbursementDate) return 'Vui lòng chọn ngày giải ngân.';
    return null;
  }, [loanAmount, totalMonths, annualRate, disbursementDate, selectedFreq.monthsPerPeriod]);

  const scheduleData = useMemo(() => {
    if (validationError) {
      return {
        rows: [] as ScheduleRow[],
        totalPrincipal: 0,
        totalInterest: 0,
        grandTotal: 0,
        firstPayment: 0,
        lastPayment: 0,
        totalPeriods: 0,
      };
    }

    const step = selectedRounding.step;
    const totalPeriods = Math.max(
      1,
      Math.floor(totalMonths / selectedFreq.monthsPerPeriod)
    );
    const periodRate = annualRate / 100 / selectedFreq.periodsPerYear;
    const basePrincipalPerPeriod = roundToStep(loanAmount / totalPeriods, step);

    const rows: ScheduleRow[] = [
      {
        stt: 0,
        dateStr: addPeriodDate(
          disbursementDate,
          0,
          selectedFreq.monthsPerPeriod,
          repaymentDay
        ),
        remainingPrincipal: loanAmount,
        principal: 0,
        interest: 0,
        totalPayment: 0,
      },
    ];

    let remaining = loanAmount;
    let totalInterest = 0;
    let totalPrincipalPaid = 0;

    for (let i = 1; i <= totalPeriods; i++) {
      const interest = roundToStep(remaining * periodRate, step);
      // Reconcile any rounding difference in the last installment per PDF 3 spec
      const principal =
        i === totalPeriods
          ? remaining
          : Math.min(remaining, basePrincipalPerPeriod);
      const nextRemaining = Math.max(0, remaining - principal);
      const totalPayment = principal + interest;

      rows.push({
        stt: i,
        dateStr: addPeriodDate(
          disbursementDate,
          i,
          selectedFreq.monthsPerPeriod,
          repaymentDay
        ),
        remainingPrincipal: nextRemaining,
        principal,
        interest,
        totalPayment,
      });

      remaining = nextRemaining;
      totalInterest += interest;
      totalPrincipalPaid += principal;
    }

    const paymentRows = rows.slice(1);
    const firstPayment = paymentRows[0]?.totalPayment || 0;
    const lastPayment = paymentRows[paymentRows.length - 1]?.totalPayment || 0;

    return {
      rows,
      totalPrincipal: totalPrincipalPaid,
      totalInterest,
      grandTotal: totalPrincipalPaid + totalInterest,
      firstPayment,
      lastPayment,
      totalPeriods,
    };
  }, [
    validationError,
    loanAmount,
    totalMonths,
    annualRate,
    disbursementDate,
    repaymentDay,
    selectedFreq,
    selectedRounding,
  ]);

  const handleExportCsv = () => {
    if (scheduleData.rows.length === 0) return;
    const header = ['STT', 'Kỳ trả nợ', 'Số gốc còn lại (VND)', 'Gốc (VND)', 'Lãi (VND)', 'Tổng Gốc + Lãi (VND)'];
    const lines = scheduleData.rows.map((r) => [
      r.stt,
      r.dateStr,
      r.remainingPrincipal,
      r.principal,
      r.interest,
      r.totalPayment,
    ]);
    lines.push([
      'TỔNG',
      '',
      0,
      scheduleData.totalPrincipal,
      scheduleData.totalInterest,
      scheduleData.grandTotal,
    ]);
    const csvContent =
      '\uFEFF' +
      [header.join(','), ...lines.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lich-tra-no-vietinbank-${disbursementDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#003B73] mb-1">
          {contentData.loanCalculator.methodTitle}
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-balance">
          {contentData.loanCalculator.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1.5 max-w-3xl">
          {contentData.loanCalculator.subtitle}
        </p>
      </div>

      {/* Main Split Input + Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Input Form (Pure Numeric Input - No Slider per PDF 3) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Số tiền vay (Direct numeric input) */}
            <div className="sm:col-span-2">
              <label
                htmlFor="loan-amount"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Số tiền vay (nhập trực tiếp)
              </label>
              <div className="relative">
                <input
                  id="loan-amount"
                  type="text"
                  inputMode="numeric"
                  value={
                    loanAmountStr
                      ? Number(loanAmountStr).toLocaleString('vi-VN')
                      : ''
                  }
                  onChange={(e) =>
                    setLoanAmountStr(e.target.value.replace(/\D/g, ''))
                  }
                  placeholder="Nhập số tiền muốn vay"
                  className="w-full pr-16 pl-4 py-3 min-h-[48px] rounded-xl border border-slate-300 focus:border-[#003B73] focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 text-base font-bold font-mono-num text-slate-900"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  VND
                </span>
              </div>
            </div>

            {/* Thời gian vay (Tháng) */}
            <div>
              <label
                htmlFor="loan-months"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Thời gian vay
              </label>
              <div className="relative">
                <input
                  id="loan-months"
                  type="text"
                  inputMode="numeric"
                  value={totalMonthsStr}
                  onChange={(e) =>
                    setTotalMonthsStr(e.target.value.replace(/\D/g, ''))
                  }
                  className="w-full pr-16 pl-4 py-3 min-h-[48px] rounded-xl border border-slate-300 focus:border-[#003B73] focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 text-base font-semibold font-mono-num text-slate-900"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                  Tháng
                </span>
              </div>
            </div>

            {/* Lãi suất (%/năm) */}
            <div>
              <label
                htmlFor="loan-rate"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Lãi suất theo năm
              </label>
              <div className="relative">
                <input
                  id="loan-rate"
                  type="text"
                  inputMode="decimal"
                  value={annualRateStr}
                  onChange={(e) => {
                    const val = e.target.value.replace(',', '.');
                    if (/^\d*\.?\d*$/.test(val)) setAnnualRateStr(val);
                  }}
                  className="w-full pr-20 pl-4 py-3 min-h-[48px] rounded-xl border border-slate-300 focus:border-[#003B73] focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 text-base font-semibold font-mono-num text-slate-900"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                  %/Năm
                </span>
              </div>
            </div>

            {/* Chu kỳ trả nợ */}
            <div>
              <label
                htmlFor="loan-freq"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Chu kỳ trả nợ
              </label>
              <select
                id="loan-freq"
                value={frequencyId}
                onChange={(e) => setFrequencyId(e.target.value)}
                className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-slate-300 bg-white focus:border-[#003B73] focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 text-sm font-semibold text-slate-900"
              >
                {contentData.loanCalculator.frequencies.map((freq) => (
                  <option key={freq.id} value={freq.id}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ngày giải ngân */}
            <div>
              <label
                htmlFor="loan-disbursement"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Ngày giải ngân
              </label>
              <input
                id="loan-disbursement"
                type="date"
                value={disbursementDate}
                onChange={(e) => setDisbursementDate(e.target.value)}
                className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-slate-300 bg-white focus:border-[#003B73] focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 text-sm font-semibold font-mono-num text-slate-900"
              />
            </div>

            {/* Ngày trả nợ định kỳ */}
            <div>
              <label
                htmlFor="loan-repayment-day"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Ngày trả nợ định kỳ (ngày trong tháng)
              </label>
              <input
                id="loan-repayment-day"
                type="number"
                min={1}
                max={31}
                value={repaymentDayStr}
                onChange={(e) => setRepaymentDayStr(e.target.value)}
                className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-slate-300 focus:border-[#003B73] focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 text-sm font-semibold font-mono-num text-slate-900"
              />
            </div>

            {/* Quy tắc làm tròn */}
            <div>
              <label
                htmlFor="loan-rounding"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Quy tắc làm tròn số
              </label>
              <select
                id="loan-rounding"
                value={roundingId}
                onChange={(e) => setRoundingId(e.target.value)}
                className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-slate-300 bg-white focus:border-[#003B73] focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 text-sm font-semibold text-slate-900"
              >
                {contentData.loanCalculator.roundingOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs sm:text-sm font-medium text-[#D71920]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Right: Summary Box */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#003B73] to-[#002247] rounded-2xl p-6 sm:p-8 text-white flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-xs text-blue-200">Tóm tắt nghĩa vụ thanh toán</p>
                <p className="text-sm font-semibold text-white">
                  {scheduleData.totalPeriods} kỳ ({selectedFreq.label.toLowerCase()}) · Lãi suất kỳ{' '}
                  <span className="font-mono-num">
                    {(
                      (Number.isNaN(annualRate) ? 0 : annualRate) /
                      selectedFreq.periodsPerYear
                    ).toFixed(2)}
                    %
                  </span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/15">
              <p className="text-xs font-medium text-blue-200 mb-2">
                Số tiền trả mỗi kỳ (dư nợ giảm dần)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-3.5">
                  <span className="text-[11px] text-blue-200 block">Kỳ đầu tiên</span>
                  <span className="text-lg sm:text-xl font-extrabold font-mono-num">
                    {formatVnd(scheduleData.firstPayment)}
                  </span>
                  <span className="text-[11px] text-blue-200 ml-1">VND</span>
                </div>
                <div className="bg-white/10 rounded-xl p-3.5">
                  <span className="text-[11px] text-blue-200 block">Kỳ cuối cùng</span>
                  <span className="text-lg sm:text-xl font-extrabold font-mono-num">
                    {formatVnd(scheduleData.lastPayment)}
                  </span>
                  <span className="text-[11px] text-blue-200 ml-1">VND</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm text-blue-100">Tổng tiền lãi phải trả</span>
                <span className="text-xl sm:text-2xl font-extrabold font-mono-num text-amber-300">
                  {formatVnd(scheduleData.totalInterest)} VND
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm text-blue-100">Tổng gốc + lãi</span>
                <span className="text-lg font-bold font-mono-num text-white">
                  {formatVnd(scheduleData.grandTotal)} VND
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/15 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={Boolean(validationError)}
              onClick={() => setShowDetailModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[46px] rounded-xl bg-white hover:bg-blue-50 text-[#003B73] text-sm font-bold whitespace-nowrap transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Xem chi tiết lịch trả nợ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Inline Preview of First 5 Periods */}
      {!validationError && scheduleData.rows.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl border border-slate-200/90 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Xem nhanh các kỳ đầu tiên
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sai lệch do làm tròn (nếu có) được tự động điều chỉnh vào kỳ trả nợ cuối cùng.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDetailModal(true)}
              className="text-sm font-semibold text-[#003B73] hover:underline cursor-pointer"
            >
              Mở toàn bộ {scheduleData.totalPeriods} kỳ
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Stt</th>
                  <th className="py-3 px-4 text-left font-semibold">Kỳ trả nợ</th>
                  <th className="py-3 px-4 text-right font-semibold">Số gốc còn lại</th>
                  <th className="py-3 px-4 text-right font-semibold">Gốc</th>
                  <th className="py-3 px-4 text-right font-semibold">Lãi</th>
                  <th className="py-3 px-4 text-right font-semibold">Tổng Gốc + Lãi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-num">
                {scheduleData.rows.slice(0, 6).map((row) => (
                  <tr key={row.stt} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-slate-700">{row.stt}</td>
                    <td className="py-3 px-4 text-slate-700">{row.dateStr}</td>
                    <td className="py-3 px-4 text-right text-slate-800">
                      {formatVnd(row.remainingPrincipal)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-800">
                      {row.stt === 0 ? '—' : formatVnd(row.principal)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-800">
                      {row.stt === 0 ? '—' : formatVnd(row.interest)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#003B73]">
                      {row.stt === 0 ? '—' : formatVnd(row.totalPayment)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Schedule Modal ("Xem chi tiết" per PDF 3 Step 2) */}
      {showDetailModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          onClick={() => setShowDetailModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Bảng tính lịch trả nợ với dư nợ giảm dần
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-mono-num">
                  Khoản vay {formatVnd(loanAmount)} VND · {scheduleData.totalPeriods} kỳ ({selectedFreq.label}) · {annualRate}%/năm
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                  aria-label="Đóng bảng chi tiết"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-100 text-slate-700 text-xs uppercase z-10">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">Stt</th>
                    <th className="py-3 px-4 text-left font-semibold">Kỳ trả nợ</th>
                    <th className="py-3 px-4 text-right font-semibold">Số gốc còn lại</th>
                    <th className="py-3 px-4 text-right font-semibold">Gốc</th>
                    <th className="py-3 px-4 text-right font-semibold">Lãi</th>
                    <th className="py-3 px-4 text-right font-semibold">Tổng Gốc + Lãi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono-num">
                  {scheduleData.rows.map((row) => (
                    <tr key={row.stt} className="hover:bg-blue-50/30">
                      <td className="py-2.5 px-4 text-slate-600">{row.stt}</td>
                      <td className="py-2.5 px-4 text-slate-800">{row.dateStr}</td>
                      <td className="py-2.5 px-4 text-right text-slate-800">
                        {formatVnd(row.remainingPrincipal)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-800">
                        {row.stt === 0 ? '' : formatVnd(row.principal)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-800">
                        {row.stt === 0 ? '' : formatVnd(row.interest)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold text-[#003B73]">
                        {row.stt === 0 ? '' : formatVnd(row.totalPayment)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="sticky bottom-0 bg-[#003B73] text-white font-mono-num font-bold">
                  <tr>
                    <td className="py-3.5 px-4" colSpan={3}>
                      TỔNG CỘNG
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {formatVnd(scheduleData.totalPrincipal)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {formatVnd(scheduleData.totalInterest)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-amber-300">
                      {formatVnd(scheduleData.grandTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
