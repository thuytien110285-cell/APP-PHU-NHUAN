import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import contentData from '../../data/contentData.json';

// ==========================================
// CẤU HÌNH GAME RẮN SĂN MỒI (Dễ chỉnh sửa)
// ==========================================
const GRID_SIZE = 18;
const TICK_MS = 165; // Tốc độ vừa phải, dễ chơi cho mọi lứa tuổi
const MILESTONE_1 = contentData.gamesSection.snake.milestone1; // 20
const MILESTONE_2 = contentData.gamesSection.snake.milestone2; // 40
const POINTS_PER_FOOD = contentData.gamesSection.snake.pointsPerFood; // 1

type SnakePhase = 'READY' | 'PLAYING' | 'GAME_OVER';
type Point = { x: number; y: number };

const formatDuration = (seconds: number): string => {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
};

export const SnakeChallengeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [phase, setPhase] = useState<SnakePhase>('READY');
  const [score, setScore] = useState<number>(0);
  const [durationSec, setDurationSec] = useState<number>(0);
  const [liveToast, setLiveToast] = useState<string | null>(null);

  const gameRef = useRef({
    snake: [
      { x: 8, y: 9 },
      { x: 7, y: 9 },
      { x: 6, y: 9 },
    ] as Point[],
    dir: { x: 1, y: 0 } as Point,
    nextDir: { x: 1, y: 0 } as Point,
    food: { x: 13, y: 9 } as Point,
    score: 0,
    milestone1Shown: false,
    milestone2Shown: false,
    startTimeMs: 0,
  });

  const spawnFood = (snakeBody: Point[]): Point => {
    let candidate: Point;
    do {
      candidate = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snakeBody.some((s) => s.x === candidate.x && s.y === candidate.y));
    return candidate;
  };

  const getCurrentRewardBadge = (pts: number): string => {
    if (pts >= MILESTONE_2) return '02 voucher 2 lít xăng';
    if (pts >= MILESTONE_1) return '01 voucher 2 lít xăng';
    return 'Chưa đạt mốc (cần 20 điểm)';
  };

  const getEndMessage = (pts: number): string => {
    if (pts >= MILESTONE_2) return contentData.gamesSection.snake.messages.end40Plus;
    if (pts >= MILESTONE_1) return contentData.gamesSection.snake.messages.end20to39;
    return contentData.gamesSection.snake.messages.endUnder20;
  };

  const startGame = useCallback(() => {
    const initialSnake = [
      { x: 8, y: 9 },
      { x: 7, y: 9 },
      { x: 6, y: 9 },
    ];
    gameRef.current = {
      snake: initialSnake,
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: spawnFood(initialSnake),
      score: 0,
      milestone1Shown: false,
      milestone2Shown: false,
      startTimeMs: Date.now(),
    };
    setScore(0);
    setDurationSec(0);
    setLiveToast(null);
    setPhase('PLAYING');
  }, []);

  const changeDirection = useCallback((dx: number, dy: number) => {
    const cur = gameRef.current.dir;
    // Prevent 180-degree self-reversal
    if (cur.x === -dx && cur.y === -dy) return;
    gameRef.current.nextDir = { x: dx, y: dy };
  }, []);

  // Arrow keys control
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phase !== 'PLAYING') return;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        changeDirection(0, -1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        changeDirection(0, 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        changeDirection(-1, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        changeDirection(1, 0);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, changeDirection]);

  // Draw canvas helper
  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 360;
    const cell = size / GRID_SIZE;

    // Clean light grid background
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 0.6;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cell, 0);
      ctx.lineTo(i * cell, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cell);
      ctx.lineTo(size, i * cell);
      ctx.stroke();
    }

    // Draw Food (VietinBank Red + Gold Star core)
    const { food, snake } = gameRef.current;
    ctx.fillStyle = '#D71920';
    ctx.beginPath();
    ctx.arc(
      food.x * cell + cell / 2,
      food.y * cell + cell / 2,
      cell * 0.38,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = '#FCD34D';
    ctx.beginPath();
    ctx.arc(
      food.x * cell + cell / 2,
      food.y * cell + cell / 2,
      cell * 0.16,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw Snake (VietinBank Blue gradient)
    snake.forEach((seg, idx) => {
      ctx.fillStyle = idx === 0 ? '#002855' : '#00509D';
      const pad = 1.5;
      ctx.beginPath();
      ctx.roundRect(
        seg.x * cell + pad,
        seg.y * cell + pad,
        cell - pad * 2,
        cell - pad * 2,
        idx === 0 ? 5 : 4
      );
      ctx.fill();
    });
  }, []);

  // Initial board render
  useEffect(() => {
    drawBoard();
  }, [drawBoard]);

  // Game tick loop
  useEffect(() => {
    if (phase !== 'PLAYING') return;

    const timer = setInterval(() => {
      const g = gameRef.current;
      g.dir = g.nextDir;
      const head = g.snake[0];
      const nextHead = { x: head.x + g.dir.x, y: head.y + g.dir.y };

      // Check wall collision or self collision
      const hitWall =
        nextHead.x < 0 ||
        nextHead.x >= GRID_SIZE ||
        nextHead.y < 0 ||
        nextHead.y >= GRID_SIZE;
      const hitSelf = g.snake.some(
        (seg) => seg.x === nextHead.x && seg.y === nextHead.y
      );

      if (hitWall || hitSelf) {
        const elapsed = Math.max(
          1,
          Math.round((Date.now() - g.startTimeMs) / 1000)
        );
        setDurationSec(elapsed);
        setPhase('GAME_OVER');
        return;
      }

      const newSnake = [nextHead, ...g.snake];
      const ateFood = nextHead.x === g.food.x && nextHead.y === g.food.y;

      if (ateFood) {
        g.score += POINTS_PER_FOOD;
        setScore(g.score);
        g.food = spawnFood(newSnake);

        // Chống nhận thưởng lặp: chỉ thông báo 1 lần duy nhất cho từng mốc trong 1 lượt
        if (g.score >= MILESTONE_2 && !g.milestone2Shown) {
          g.milestone2Shown = true;
          setLiveToast(contentData.gamesSection.snake.messages.milestone2Live);
          setTimeout(() => setLiveToast(null), 4500);
        } else if (g.score >= MILESTONE_1 && !g.milestone1Shown) {
          g.milestone1Shown = true;
          setLiveToast(contentData.gamesSection.snake.messages.milestone1Live);
          setTimeout(() => setLiveToast(null), 4500);
        }
      } else {
        newSnake.pop();
      }

      g.snake = newSnake;
      drawBoard();
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [phase, drawBoard]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#003B73]">
              VietinBank · Mini Game 02
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {contentData.gamesSection.snake.gameTitle}
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              {contentData.gamesSection.snake.subtitle}
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 self-start sm:self-auto">
            Trạng thái:{' '}
            {phase === 'READY'
              ? 'Sẵn sàng'
              : phase === 'PLAYING'
              ? 'Đang chơi'
              : 'Đã kết thúc'}
          </span>
        </div>

        {/* Non-blocking Milestone Toast Banner */}
        {liveToast && phase === 'PLAYING' && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-bold">{liveToast}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Center / Left: Game Board */}
          <div className="lg:col-span-7 flex flex-col items-center space-y-4">
            <div className="relative rounded-xl overflow-hidden border-2 border-[#003B73]/20 bg-slate-50 w-full max-w-[360px]">
              <canvas
                ref={canvasRef}
                width={360}
                height={360}
                className="w-full h-auto block aspect-square"
              />

              {phase === 'READY' && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-4">
                  <button
                    type="button"
                    onClick={startGame}
                    className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[48px] rounded-xl bg-[#D71920] hover:bg-[#B8141A] text-white text-base font-bold shadow-lg cursor-pointer"
                  >
                    <Play className="w-5 h-5" />
                    <span>{contentData.gamesSection.snake.startButton}</span>
                  </button>
                </div>
              )}

              {phase === 'GAME_OVER' && (
                <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-[2px] flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl p-5 w-full text-center space-y-3 shadow-2xl border border-slate-200">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-extrabold text-[#003B73]">
                      Phiếu xác nhận quà tặng
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-3 text-left text-xs space-y-1.5 border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Điểm cuối cùng:</span>
                        <span className="font-bold font-mono-num text-slate-900">
                          {score} điểm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mức quà đạt được:</span>
                        <span className="font-bold text-[#D71920]">
                          {getCurrentRewardBadge(score)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Thời gian chơi:</span>
                        <span className="font-bold font-mono-num text-slate-900">
                          {formatDuration(durationSec)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed">
                      {getEndMessage(score)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {contentData.gamesSection.snake.messages.receiptInstruction}
                    </p>
                    <button
                      type="button"
                      onClick={startGame}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-[#003B73] hover:bg-[#002855] text-white text-sm font-bold cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{contentData.gamesSection.snake.retryButton}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Touch D-Pad for Tablet/Mobile counter visitors */}
            <div className="grid grid-cols-3 gap-2 w-44 pt-1" aria-label="Phím điều hướng cảm ứng">
              <div />
              <button
                type="button"
                onClick={() => changeDirection(0, -1)}
                className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-[#003B73] active:text-white flex items-center justify-center text-slate-800 cursor-pointer"
                aria-label="Đi lên"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <div />
              <button
                type="button"
                onClick={() => changeDirection(-1, 0)}
                className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-[#003B73] active:text-white flex items-center justify-center text-slate-800 cursor-pointer"
                aria-label="Sang trái"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => changeDirection(0, 1)}
                className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-[#003B73] active:text-white flex items-center justify-center text-slate-800 cursor-pointer"
                aria-label="Đi xuống"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => changeDirection(1, 0)}
                className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-[#003B73] active:text-white flex items-center justify-center text-slate-800 cursor-pointer"
                aria-label="Sang phải"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right: Score HUD & Simple Rules */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <div>
                <p className="text-xs font-medium text-slate-500">Điểm hiện tại</p>
                <p className="text-3xl font-extrabold text-[#003B73] font-mono-num">
                  {score}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/80">
                <p className="text-xs font-medium text-slate-500">
                  Mốc thưởng hiện tại
                </p>
                <p className="text-sm font-bold text-[#D71920] mt-0.5">
                  {getCurrentRewardBadge(score)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Hướng dẫn & Cơ cấu quà tặng
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {contentData.gamesSection.snake.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono-num font-bold text-[#003B73]">
                      0{idx + 1}.
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
