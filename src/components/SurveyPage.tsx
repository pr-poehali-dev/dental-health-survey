import { useState, useEffect } from "react";
import { questions } from "@/data/questions";
import type { Answer } from "@/pages/Index";
import Icon from "@/components/ui/icon";

const SURVEY_URL = "https://functions.poehali.dev/ab182c20-7808-481b-9b10-e1d163fe6353";
const MIN_RESPONSES = 3;

type Props = {
  onComplete: (answers: Answer[]) => void;
  onViewStats: () => void;
};

type QuestionStat = {
  total: number;
  distribution: Record<number, { count: number; percent: number }>;
};

export default function SurveyPage({ onComplete, onViewStats }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [stat, setStat] = useState<QuestionStat | null>(null);
  const [statLoading, setStatLoading] = useState(false);

  const question = questions[current];
  const progress = ((current) / questions.length) * 100;
  const isLast = current === questions.length - 1;
  const showInsight = current > 0;

  useEffect(() => {
    if (!showInsight || selected === null) return;
    setStatLoading(true);
    setStat(null);
    fetch(`${SURVEY_URL}?question_id=${question.id}`)
      .then((r) => r.json())
      .then((data) => setStat(data))
      .catch(() => {})
      .finally(() => setStatLoading(false));
  }, [selected, question.id, showInsight]);

  const handleSelect = (optionIndex: number) => {
    setSelected(optionIndex);
  };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, { questionId: question.id, optionIndex: selected }];
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      if (isLast) {
        onComplete(newAnswers);
      } else {
        setAnswers(newAnswers);
        setSelected(null);
        setStat(null);
        setCurrent((c) => c + 1);
      }
    }, 300);
  };

  const handleBack = () => {
    if (current === 0) return;
    const prev = answers.slice(0, -1);
    setAnswers(prev);
    setSelected(null);
    setStat(null);
    setCurrent((c) => c - 1);
  };

  const categoryColors: Record<string, string> = {
    general: "bg-indigo-100 text-indigo-700",
    hygiene: "bg-blue-100 text-blue-700",
    dentist: "bg-sky-100 text-sky-700",
    habits: "bg-cyan-100 text-cyan-700",
  };

  const categoryIcons: Record<string, string> = {
    general: "User",
    hygiene: "Sparkles",
    dentist: "Stethoscope",
    habits: "Heart",
  };

  const categoryLabel: Record<string, string> = {
    general: "Общее",
    hygiene: "Гигиена",
    dentist: "Стоматолог",
    habits: "Привычки",
  };

  const renderInsight = () => {
    if (selected === null) return null;

    const hasEnoughData = stat && stat.total >= MIN_RESPONSES;

    if (statLoading) {
      return (
        <div className="mt-5 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin flex-shrink-0" />
          <span className="text-sm text-blue-400">Загружаю данные других участников...</span>
        </div>
      );
    }

    if (!hasEnoughData) {
      return (
        <div className="mt-5 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-2">
          <Icon name="Info" size={14} className="text-blue-400 flex-shrink-0" />
          <span className="text-sm text-blue-400">Пока недостаточно данных для сравнения</span>
        </div>
      );
    }

    const selectedPct = stat.distribution[selected]?.percent ?? 0;
    const topOptionIdx = Object.entries(stat.distribution)
      .sort((a, b) => b[1].percent - a[1].percent)[0]?.[0];
    const topPct = stat.distribution[Number(topOptionIdx)]?.percent ?? 0;
    const topOption = question.options[Number(topOptionIdx)];
    const isTopChoice = Number(topOptionIdx) === selected;

    return (
      <div className="mt-5 px-4 py-3.5 rounded-2xl bg-blue-50 border border-blue-100 animate-fade-in">
        <div className="flex items-start gap-2.5">
          <Icon name="Users" size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 leading-relaxed">
            {isTopChoice ? (
              <>
                <span className="font-semibold">{selectedPct}% участников</span> ответили так же, как вы — это самый популярный ответ.
              </>
            ) : (
              <>
                Так ответили <span className="font-semibold">{selectedPct}% участников</span>.{" "}
                Чаще всего выбирают «{topOption}» — <span className="font-semibold">{topPct}%</span>.
              </>
            )}
          </div>
        </div>
        <div className="mt-2.5 flex gap-1 flex-wrap">
          {question.options.map((_, idx) => {
            const pct = stat.distribution[idx]?.percent ?? 0;
            return (
              <div key={idx} className="flex items-center gap-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === selected ? "bg-blue-500" : "bg-blue-200"}`}
                  style={{ width: `${Math.max(pct * 0.8, 4)}px` }}
                />
                <span className={`text-xs ${idx === selected ? "text-blue-600 font-semibold" : "text-blue-300"}`}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Icon name="Smile" size={16} className="text-white" />
            </div>
            <span className="font-semibold text-blue-900 text-sm">Опрос о здоровье зубов</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-400 font-medium">
              {current + 1} / {questions.length}
            </span>
            <button
              onClick={onViewStats}
              title="Статистика"
              className="w-7 h-7 rounded-full flex items-center justify-center text-blue-200 hover:text-blue-400 hover:bg-blue-50 transition-all duration-200"
            >
              <Icon name="BarChart2" size={14} />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-blue-100">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div
          className={`w-full max-w-2xl transition-all duration-300 ${
            animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0 animate-fade-in"
          }`}
          key={current}
        >
          {/* Category badge */}
          <div className="mb-6 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[question.category]}`}>
              <Icon name={categoryIcons[question.category] as "Sparkles"} size={12} />
              {categoryLabel[question.category]}
            </span>
            <span className="text-blue-300 text-xs">Вопрос {current + 1}</span>
          </div>

          {/* Question */}
          <h2 className="text-2xl md:text-3xl font-bold text-blue-950 mb-8 leading-tight">
            {question.text}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 group
                  ${selected === idx
                    ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                    : "border-blue-100 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                    ${selected === idx ? "border-blue-500 bg-blue-500" : "border-blue-200 group-hover:border-blue-400"}`}>
                    {selected === idx && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className={`font-medium transition-colors duration-200 ${selected === idx ? "text-blue-800" : "text-blue-900"}`}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Insight block */}
          {showInsight && renderInsight()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={current === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${current === 0
                  ? "text-blue-200 cursor-not-allowed"
                  : "text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                }`}
            >
              <Icon name="ChevronLeft" size={16} />
              Назад
            </button>

            <button
              onClick={handleNext}
              disabled={selected === null}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-semibold text-sm transition-all duration-200
                ${selected !== null
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-105"
                  : "bg-blue-100 text-blue-300 cursor-not-allowed"
                }`}
            >
              {isLast ? "Завершить опрос" : "Следующий вопрос"}
              <Icon name="ArrowRight" size={16} />
            </button>
          </div>
        </div>
      </main>

      {/* Decorative elements */}
      <div className="fixed top-20 right-8 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 left-8 w-48 h-48 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
