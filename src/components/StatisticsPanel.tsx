import { useState, useEffect } from "react";
import { questions } from "@/data/questions";
import type { Answer } from "@/pages/Index";
import Icon from "@/components/ui/icon";

const SURVEY_URL = "https://functions.poehali.dev/ab182c20-7808-481b-9b10-e1d163fe6353";

type Props = {
  answers: Answer[];
  onRestart: () => void;
};

type StatsData = {
  total_responses: number;
  avg_score: number;
  answers_distribution: Record<number, Record<number, number>>;
};

const categoryMeta: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  general: { label: "Общее", icon: "User", color: "text-indigo-700", bg: "bg-indigo-100" },
  hygiene: { label: "Гигиена", icon: "Sparkles", color: "text-blue-700", bg: "bg-blue-100" },
  dentist: { label: "Стоматолог", icon: "Stethoscope", color: "text-sky-700", bg: "bg-sky-100" },
  habits: { label: "Привычки", icon: "Heart", color: "text-cyan-700", bg: "bg-cyan-100" },
};

export default function StatisticsPanel({ answers, onRestart }: Props) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearPassword, setClearPassword] = useState("");
  const [clearError, setClearError] = useState(false);
  const [clearShake, setClearShake] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadStats = () => {
    setLoading(true);
    fetch(SURVEY_URL)
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleClear = async (e: React.FormEvent) => {
    e.preventDefault();
    setClearing(true);
    const res = await fetch(SURVEY_URL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: clearPassword }),
    });
    setClearing(false);
    if (res.ok) {
      setShowClearDialog(false);
      setClearPassword("");
      setClearError(false);
      loadStats();
    } else {
      setClearError(true);
      setClearShake(true);
      setTimeout(() => setClearShake(false), 500);
    }
  };

  const getOptionPercent = (questionId: number, optionIndex: number): number => {
    if (stats && stats.answers_distribution) {
      const dist = stats.answers_distribution[questionId];
      if (!dist) return 0;
      const total = Object.values(dist).reduce((a, b) => a + b, 0);
      if (total === 0) return 0;
      return Math.round(((dist[optionIndex] || 0) / total) * 100);
    }
    const ans = answers.filter((a) => a.questionId === questionId);
    if (ans.length === 0) return 0;
    const count = ans.filter((a) => a.optionIndex === optionIndex).length;
    return Math.round((count / ans.length) * 100);
  };

  const grouped = {
    general: questions.filter((q) => q.category === "general"),
    hygiene: questions.filter((q) => q.category === "hygiene"),
    dentist: questions.filter((q) => q.category === "dentist"),
    habits: questions.filter((q) => q.category === "habits"),
  };

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={onRestart}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700 text-sm font-medium mb-6 transition-colors"
          >
            <Icon name="ArrowLeft" size={16} />
            Вернуться к началу
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-blue-950 mb-2">Статистика ответов</h1>
            <button
              onClick={() => { setShowClearDialog(true); setClearPassword(""); setClearError(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 text-xs font-medium transition-colors"
            >
              <Icon name="Trash2" size={13} />
              Очистить
            </button>
          </div>
          <p className="text-blue-400 text-sm">Распределение всех ответов на каждый вопрос</p>

          {/* Summary bar */}
          <div className="mt-5 bg-white rounded-2xl border border-blue-100 p-4 flex items-center gap-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Icon name="Users" size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-400">Всего прошли опрос</p>
              {loading ? (
                <div className="w-12 h-6 bg-blue-100 rounded animate-pulse mt-0.5" />
              ) : (
                <p className="text-2xl font-bold text-blue-800">{stats?.total_responses ?? 1}</p>
              )}
            </div>
            <div className="w-px h-8 bg-blue-100" />
            <div>
              <p className="text-xs text-blue-400">Средний балл</p>
              {loading ? (
                <div className="w-12 h-6 bg-blue-100 rounded animate-pulse mt-0.5" />
              ) : (
                <p className="text-2xl font-bold text-blue-800">{stats?.avg_score ?? "—"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sections */}
        {(Object.keys(grouped) as Array<keyof typeof grouped>).map((cat) => {
          const meta = categoryMeta[cat];
          return (
            <div key={cat} className="mb-8 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-7 h-7 rounded-lg ${meta.bg} ${meta.color} flex items-center justify-center`}>
                  <Icon name={meta.icon as "Sparkles"} size={14} />
                </span>
                <h2 className="font-bold text-blue-900">{meta.label}</h2>
              </div>

              <div className="space-y-5">
                {grouped[cat].map((question) => {
                  const answer = answers.find((a) => a.questionId === question.id);
                  const selectedIdx = answer?.optionIndex ?? -1;

                  return (
                    <div key={question.id} className="bg-white rounded-2xl border border-blue-100 p-5">
                      <p className="text-sm font-semibold text-blue-900 mb-4 leading-snug">
                        {question.text}
                      </p>
                      <div className="space-y-2.5">
                        {question.options.map((option, idx) => {
                          const pct = getOptionPercent(question.id, idx);
                          const isSelected = selectedIdx === idx;

                          return (
                            <div key={idx}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-medium flex items-center gap-1 ${isSelected ? "text-blue-700" : "text-blue-400"}`}>
                                  {isSelected && <Icon name="Check" size={10} className="text-blue-600" />}
                                  {option}
                                </span>
                                <span className={`text-xs font-bold ml-2 flex-shrink-0 ${isSelected ? "text-blue-700" : "text-blue-400"}`}>
                                  {loading ? "…" : `${pct}%`}
                                </span>
                              </div>
                              <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                                {!loading && (
                                  <div
                                    className={`h-full rounded-full animate-progress ${isSelected ? "bg-blue-500" : "bg-blue-200"}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                )}
                                {loading && (
                                  <div className="h-full w-1/3 bg-blue-100 rounded-full animate-pulse" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div className="text-center mt-4 mb-10">
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all duration-200 hover:scale-105"
          >
            <Icon name="RotateCcw" size={16} />
            Пройти опрос заново
          </button>
        </div>
      </div>

      {/* Decoratives */}
      <div className="fixed top-20 right-8 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />

      {/* Clear stats dialog */}
      {showClearDialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-6">
          <div className={`bg-white rounded-3xl border border-red-100 shadow-xl p-8 w-full max-w-sm ${clearShake ? "animate-shake" : ""}`}>
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="Trash2" size={22} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-blue-950 text-center mb-1">Очистить статистику?</h2>
            <p className="text-sm text-blue-400 text-center mb-5">Все ответы будут удалены безвозвратно. Введите пароль для подтверждения.</p>
            <form onSubmit={handleClear} className="space-y-3">
              <input
                type="password"
                value={clearPassword}
                onChange={(e) => { setClearPassword(e.target.value); setClearError(false); }}
                placeholder="Пароль"
                autoFocus
                className={`w-full px-4 py-3 rounded-2xl border-2 outline-none text-sm font-medium transition-all duration-200 bg-red-50/30
                  ${clearError ? "border-red-300 text-red-700 placeholder:text-red-300" : "border-red-100 text-blue-900 placeholder:text-blue-300 focus:border-red-400"}`}
              />
              {clearError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <Icon name="AlertCircle" size={12} />
                  Неверный пароль
                </p>
              )}
              <button
                type="submit"
                disabled={clearing}
                className="w-full py-3 rounded-2xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 shadow-lg shadow-red-100 transition-all duration-200 disabled:opacity-60"
              >
                {clearing ? "Удаление..." : "Очистить всё"}
              </button>
            </form>
            <button
              onClick={() => setShowClearDialog(false)}
              className="w-full mt-3 py-2 text-sm text-blue-400 hover:text-blue-600 transition-colors"
            >
              Отмена
            </button>
          </div>
          <style>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              20% { transform: translateX(-8px); }
              40% { transform: translateX(8px); }
              60% { transform: translateX(-5px); }
              80% { transform: translateX(5px); }
            }
            .animate-shake { animation: shake 0.5s ease-out; }
          `}</style>
        </div>
      )}
    </div>
  );
}