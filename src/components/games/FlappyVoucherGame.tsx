import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Home,
  Trophy,
  Play,
  Ticket,
} from 'lucide-react';
import contentData from '../../data/contentData.json';

// ==========================================
// CẤU HÌNH GAME (Có thể chỉnh sửa nhanh)
// ==========================================
const WIN_SCORE = contentData.gamesSection.flappy.winScore; // 20
const GRAVITY = 0.24; // Trọng lực nhẹ nhàng cho khách hàng phổ thông
const JUMP_FORCE = -5.6; // Lực bay êm ái
const PIPE_SPEED = 2.35; // Tốc độ ống vừa phải (hoàn thành 20 ống trong ~45-65s)
const PIPE_GAP = 165; // Khoảng trống giữa hai ống đủ rộng, dễ vượt qua
const VOUCHER_TEXT = contentData.gamesSection.flappy.voucherText; // "Voucher 2 lít xăng"
const BRAND_NAME = contentData.gamesSection.flappy.brandName; // "VietinBank"
const GAME_TITLE = contentData.gamesSection.flappy.gameTitle;

const STORAGE_BEST_KEY = 'vb_flappy_best_score';
const STORAGE_VOUCHER_KEY = 'vb_flappy_latest_voucher';

interface FlappyWinPayload {
  score: number;
  voucherCode: string;
  reward: string;
  timestamp: string;
}

interface FlappyLosePayload {
  score: number;
  timestamp: string;
}

declare global {
  interface Window {
    onFlappyVoucherWin?: (payload: FlappyWinPayload) => void;
    onFlappyVoucherLose?: (payload: FlappyLosePayload) => void;
  }
}

interface FlappyVoucherGameProps {
  onBackToMenu: () => void;
}

type FlappyPhase = 'START' | 'PLAYING' | 'LOST' | 'WON';

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rot: number;
}

export const FlappyVoucherGame: React.FC<FlappyVoucherGameProps> = ({
  onBackToMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [phase, setPhase] = useState<FlappyPhase>('START');
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_BEST_KEY);
    return saved ? Number(saved) || 0 : 0;
  });
  const [latestVoucher, setLatestVoucher] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_VOUCHER_KEY);
  });
  const [currentVoucher, setCurrentVoucher] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false); // Tắt mặc định theo yêu cầu
  const [copied, setCopied] = useState<boolean>(false);
  const [shakeActive, setShakeActive] = useState<boolean>(false);

  // Mutable game loop state
  const stateRef = useRef({
    phase: 'START' as FlappyPhase,
    birdY: 220,
    birdVy: 0,
    birdRot: 0,
    pipes: [] as Pipe[],
    score: 0,
    frameCount: 0,
    voucherGeneratedThisRound: false,
    confetti: [] as ConfettiPiece[],
  });

  const CANVAS_W = 460;
  const CANVAS_H = 440;
  const BIRD_X = 96;
  const BIRD_R = 16;
  const PIPE_W = 58;
  const PIPE_SPAWN_FRAMES = 105; // ~1.75s mỗi ống ở 60fps

  const playTone = useCallback(
    (freq: number, duration: number, type: OscillatorType = 'sine') => {
      if (!soundEnabled) return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        // Ignore audio errors
      }
    },
    [soundEnabled]
  );

  // Sinh mã voucher VB-XXXXXX (6 chữ số ngẫu nhiên)
  const generateVoucherCode = useCallback((): string => {
    const randomSix = Math.floor(100000 + Math.random() * 900000);
    return `VB-${randomSix}`;
  }, []);

  const copyVoucherCode = async () => {
    if (!currentVoucher) return;
    try {
      await navigator.clipboard.writeText(currentVoucher);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const getEncouragement = (pts: number): string => {
    const enc = contentData.gamesSection.flappy.encouragements;
    if (pts >= WIN_SCORE) return enc.win;
    if (pts >= 15) return enc.tier4;
    if (pts >= 10) return enc.tier3;
    if (pts >= 5) return enc.tier2;
    return enc.tier1;
  };

  // Khởi tạo lại trạng thái ván mới
  const resetGame = useCallback(() => {
    stateRef.current = {
      phase: 'START',
      birdY: CANVAS_H / 2 - 20,
      birdVy: 0,
      birdRot: 0,
      pipes: [],
      score: 0,
      frameCount: 0,
      voucherGeneratedThisRound: false,
      confetti: [],
    };
    setScore(0);
    setCurrentVoucher(null);
    setCopied(false);
    setShakeActive(false);
    setPhase('START');
  }, []);

  const winGame = useCallback(() => {
    if (stateRef.current.phase !== 'PLAYING') return;
    stateRef.current.phase = 'WON';
    setPhase('WON');

    // Chỉ sinh một mã voucher cho một lượt thắng
    let code = currentVoucher;
    if (!stateRef.current.voucherGeneratedThisRound) {
      stateRef.current.voucherGeneratedThisRound = true;
      code = generateVoucherCode();
      setCurrentVoucher(code);
      setLatestVoucher(code);
      localStorage.setItem(STORAGE_VOUCHER_KEY, code);
    }

    setBestScore((prev) => {
      const next = Math.max(prev, WIN_SCORE);
      localStorage.setItem(STORAGE_BEST_KEY, String(next));
      return next;
    });

    // Tạo confetti ăn mừng trên canvas
    const colors = ['#D71920', '#003B73', '#F59E0B', '#10B981', '#FFFFFF'];
    stateRef.current.confetti = Array.from({ length: 55 }, () => ({
      x: Math.random() * CANVAS_W,
      y: -10 - Math.random() * 120,
      vx: (Math.random() - 0.5) * 3.5,
      vy: 1.8 + Math.random() * 2.5,
      size: 5 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
    }));

    playTone(660, 0.15, 'triangle');
    setTimeout(() => playTone(880, 0.25, 'triangle'), 120);

    if (typeof window.onFlappyVoucherWin === 'function' && code) {
      window.onFlappyVoucherWin({
        score: WIN_SCORE,
        voucherCode: code,
        reward: VOUCHER_TEXT,
        timestamp: new Date().toISOString(),
      });
    }
  }, [currentVoucher, generateVoucherCode, playTone]);

  const endGame = useCallback(() => {
    if (stateRef.current.phase !== 'PLAYING') return;
    stateRef.current.phase = 'LOST';
    const finalScore = stateRef.current.score;
    setPhase('LOST');
    setShakeActive(true);
    setTimeout(() => setShakeActive(false), 380);

    setBestScore((prev) => {
      const next = Math.max(prev, finalScore);
      localStorage.setItem(STORAGE_BEST_KEY, String(next));
      return next;
    });

    playTone(190, 0.22, 'sawtooth');

    if (typeof window.onFlappyVoucherLose === 'function') {
      window.onFlappyVoucherLose({
        score: finalScore,
        timestamp: new Date().toISOString(),
      });
    }
  }, [playTone]);

  const startGame = useCallback(() => {
    stateRef.current = {
      phase: 'PLAYING',
      birdY: CANVAS_H / 2 - 20,
      birdVy: JUMP_FORCE * 0.7,
      birdRot: 0,
      pipes: [
        {
          x: CANVAS_W + 80,
          topHeight: 110 + Math.random() * (CANVAS_H - PIPE_GAP - 200),
          passed: false,
        },
      ],
      score: 0,
      frameCount: 0,
      voucherGeneratedThisRound: false,
      confetti: [],
    };
    setScore(0);
    setCurrentVoucher(null);
    setCopied(false);
    setShakeActive(false);
    setPhase('PLAYING');
    playTone(440, 0.08, 'sine');
  }, [playTone]);

  const flap = useCallback(() => {
    if (stateRef.current.phase === 'PLAYING') {
      stateRef.current.birdVy = JUMP_FORCE;
      playTone(460, 0.07, 'sine');
    }
  }, [playTone]);

  // Keyboard Spacebar control (chống cuộn trang)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (stateRef.current.phase === 'PLAYING') {
          e.preventDefault();
          flap();
        } else if (stateRef.current.phase === 'START') {
          e.preventDefault();
          startGame();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [flap, startGame]);

  // Main Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    ctx.scale(dpr, dpr);

    let lastTime = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.667, 2.2); // Normalize to 60fps
      lastTime = now;

      const s = stateRef.current;

      // Sky gradient (VietinBank clean daylight palette)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      skyGrad.addColorStop(0, '#EFF6FF');
      skyGrad.addColorStop(1, '#DBEAFE');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Subtle clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.arc(85, 78, 22, 0, Math.PI * 2);
      ctx.arc(108, 72, 26, 0, Math.PI * 2);
      ctx.arc(134, 80, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(320, 108, 18, 0, Math.PI * 2);
      ctx.arc(342, 102, 24, 0, Math.PI * 2);
      ctx.arc(366, 110, 17, 0, Math.PI * 2);
      ctx.fill();

      if (s.phase === 'PLAYING') {
        s.frameCount += dt;

        // Bird physics
        s.birdVy += GRAVITY * dt;
        s.birdY += s.birdVy * dt;
        s.birdRot = Math.max(-0.45, Math.min(0.65, s.birdVy * 0.08));

        // Spawn pipes
        const lastPipe = s.pipes[s.pipes.length - 1];
        if (!lastPipe || CANVAS_W - lastPipe.x >= PIPE_SPEED * PIPE_SPAWN_FRAMES) {
          const minTop = 54;
          const maxTop = CANVAS_H - PIPE_GAP - 78;
          s.pipes.push({
            x: CANVAS_W + 20,
            topHeight: minTop + Math.random() * (maxTop - minTop),
            passed: false,
          });
        }

        // Update pipes & check collision
        for (let i = s.pipes.length - 1; i >= 0; i--) {
          const p = s.pipes[i];
          p.x -= PIPE_SPEED * dt;

          // Score check (không cho tăng điểm sau khi đạt WIN_SCORE)
          if (!p.passed && p.x + PIPE_W < BIRD_X && s.score < WIN_SCORE) {
            p.passed = true;
            s.score += 1;
            setScore(s.score);
            playTone(620, 0.09, 'triangle');

            if (s.score >= WIN_SCORE) {
              winGame();
            }
          }

          // Collision check (dùng hitbox hơi nhỏ hơn hình vẽ để dễ chịu cho khách hàng)
          const hitR = BIRD_R - 3;
          const withinPipeX = BIRD_X + hitR > p.x && BIRD_X - hitR < p.x + PIPE_W;
          const hitTop = s.birdY - hitR < p.topHeight;
          const hitBottom = s.birdY + hitR > p.topHeight + PIPE_GAP;

          if (withinPipeX && (hitTop || hitBottom)) {
            endGame();
          }

          if (p.x + PIPE_W < -20) {
            s.pipes.splice(i, 1);
          }
        }

        // Ceiling / Floor collision
        if (s.birdY - BIRD_R < 0) {
          s.birdY = BIRD_R;
          s.birdVy = 0;
        }
        if (s.birdY + BIRD_R >= CANVAS_H - 28) {
          s.birdY = CANVAS_H - 28 - BIRD_R;
          endGame();
        }
      } else if (s.phase === 'START') {
        s.frameCount += dt;
        s.birdY = CANVAS_H / 2 - 20 + Math.sin(s.frameCount * 0.08) * 8;
      }

      // Draw Pipes (VietinBank Blue pillars with crisp caps)
      for (const p of s.pipes) {
        ctx.fillStyle = '#003B73';
        ctx.fillRect(p.x, 0, PIPE_W, p.topHeight);
        ctx.fillStyle = '#002855';
        ctx.fillRect(p.x - 4, p.topHeight - 16, PIPE_W + 8, 16);

        const bottomY = p.topHeight + PIPE_GAP;
        ctx.fillStyle = '#003B73';
        ctx.fillRect(p.x, bottomY, PIPE_W, CANVAS_H - bottomY - 28);
        ctx.fillStyle = '#002855';
        ctx.fillRect(p.x - 4, bottomY, PIPE_W + 8, 16);
      }

      // Ground strip
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(0, CANVAS_H - 28, CANVAS_W, 28);
      ctx.fillStyle = '#D71920';
      ctx.fillRect(0, CANVAS_H - 28, CANVAS_W, 4);

      // Draw Flying VietinBank Card / Mascot
      ctx.save();
      ctx.translate(BIRD_X, s.birdY);
      ctx.rotate(s.birdRot);

      // Card body (VietinBank Red + Gold chip)
      ctx.fillStyle = '#D71920';
      ctx.beginPath();
      ctx.roundRect(-20, -14, 40, 28, 7);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Gold EMV chip
      ctx.fillStyle = '#FCD34D';
      ctx.beginPath();
      ctx.roundRect(-13, -6, 10, 8, 2);
      ctx.fill();

      // Cute wing
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(4, 2, 7, 4, -0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Confetti when WON
      if (s.phase === 'WON') {
        for (const c of s.confetti) {
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          c.rot += 0.08 * dt;
          if (c.y > CANVAS_H) c.y = -10;
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate(c.rot);
          ctx.fillStyle = c.color;
          ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.65);
          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [endGame, playTone, winGame]);

  const progressPct = Math.min(100, (score / WIN_SCORE) * 100);

  return (
    <div id="flappy-voucher-game" className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 space-y-5">
        {/* Header & Sound Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#003B73]">
              {BRAND_NAME} · Mini Game 01
            </p>
            <h2 className="text-xl font-extrabold text-slate-900">{GAME_TITLE}</h2>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-[#003B73]" />
                <span>Âm thanh: Bật</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span>Âm thanh: Tắt</span>
              </>
            )}
          </button>
        </div>

        {/* HUD: Score, Progress Bar & Encouragement */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-base font-extrabold text-[#003B73] font-mono-num">
              Điểm: {score}/{WIN_SCORE}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#D71920]">
              {getEncouragement(score)}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#003B73] to-[#D71920] transition-all duration-200 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span className="font-mono-num">Kỷ lục cao nhất: {bestScore}/{WIN_SCORE}</span>
            {latestVoucher && (
              <span className="font-mono-num font-semibold text-emerald-700">
                Mã gần nhất: {latestVoucher}
              </span>
            )}
          </div>
        </div>

        {/* Responsive Canvas Stage (anti-zoom & anti-scroll on touch) */}
        <div
          className={`relative rounded-xl overflow-hidden border border-slate-200 select-none touch-manipulation ${
            shakeActive ? 'animate-[shake_0.35s_ease-in-out]' : ''
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={(e) => {
              e.preventDefault();
              if (phase === 'PLAYING') flap();
            }}
            className="w-full h-auto block cursor-pointer aspect-[460/440]"
          />

          {/* Màn hình Bắt đầu */}
          {phase === 'START' && (
            <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] flex items-center justify-center p-5">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-[#D71920] flex items-center justify-center mx-auto">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {GAME_TITLE}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1.5">
                    {contentData.gamesSection.flappy.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startGame}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[48px] rounded-xl bg-[#D71920] hover:bg-[#B8141A] text-white text-base font-bold transition-colors cursor-pointer"
                >
                  <Play className="w-5 h-5" />
                  <span>{contentData.gamesSection.flappy.startButton}</span>
                </button>
                <p className="text-xs font-medium text-slate-500">
                  {contentData.gamesSection.flappy.controlHint}
                </p>
              </div>
            </div>
          )}

          {/* Màn hình Thua */}
          {phase === 'LOST' && (
            <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px] flex items-center justify-center p-5">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Rất tiếc, bạn đã vượt qua {score}/{WIN_SCORE} thử thách
                </h3>
                <p className="text-sm text-slate-600">
                  {contentData.gamesSection.flappy.loseEncouragement}
                </p>
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={startGame}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-xl bg-[#003B73] hover:bg-[#002855] text-white text-sm font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Chơi lại</span>
                  </button>
                  <button
                    type="button"
                    onClick={onBackToMenu}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold cursor-pointer"
                  >
                    <Home className="w-4 h-4" />
                    <span>Về màn hình chính</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Màn hình Chiến thắng */}
          {phase === 'WON' && (
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border-2 border-amber-400">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#D71920]">
                    {contentData.gamesSection.flappy.winTitle}
                  </h3>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                    {contentData.gamesSection.flappy.winMessage}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#003B73]">
                    Mã nhận quà của Quý khách
                  </p>
                  <p className="text-2xl font-extrabold font-mono-num tracking-wider text-[#003B73]">
                    {currentVoucher}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {contentData.gamesSection.flappy.winInstruction}
                </p>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={copyVoucherCode}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-3 min-h-[44px] rounded-xl bg-[#003B73] hover:bg-[#002855] text-white text-xs sm:text-sm font-bold cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Sao chép mã</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetGame}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-3 min-h-[44px] rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Chơi lại</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};
