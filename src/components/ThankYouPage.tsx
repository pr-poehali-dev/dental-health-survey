import { useEffect, useRef } from "react";
import type { Answer } from "@/pages/Index";
import { questions } from "@/data/questions";
import Icon from "@/components/ui/icon";

const SURVEY_URL = "https://functions.poehali.dev/ab182c20-7808-481b-9b10-e1d163fe6353";

type Props = {
  answers: Answer[];
  onViewStats: () => void;
  onRestart: () => void;
};

function getHealthScore(answers: Answer[]): { score: number; label: string; color: string } {
  let total = 0;
  answers.forEach((a) => {
    const q = questions.find((q) => q.id === a.questionId);
    if (!q) return;
    const maxIndex = q.options.length - 1;
    total += (maxIndex - a.optionIndex) / maxIndex;
  });
  const score = Math.round((total / answers.length) * 100);

  if (score >= 75) return { score, label: "Отличный уход", color: "text-emerald-600" };
  if (score >= 50) return { score, label: "Хороший уход", color: "text-blue-600" };
  if (score >= 25) return { score, label: "Есть над чем работать", color: "text-amber-600" };
  return { score, label: "Нужна забота о зубах", color: "text-red-500" };
}

export default function ThankYouPage({ answers, onViewStats, onRestart }: Props) {
  const { score, label, color } = getHealthScore(answers);
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const sessionId = crypto.randomUUID();
    fetch(SURVEY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, score, answers }),
    }).catch(() => {});
  }, []);

  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg text-center animate-slide-up">

        {/* Circle score */}
        <div className="flex justify-center mb-8">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#dbeafe" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="#2563eb"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-blue-800">{score}</span>
              <span className="text-xs text-blue-400 font-medium mt-0.5">из 100</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mb-2">
          <span className={`text-xl font-bold ${color}`}>{label}</span>
        </div>

        {/* Thank you message */}
        <div className="bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-50 p-8 mb-8">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Icon name="CheckCircle" size={28} className="text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-blue-950 mb-3 leading-tight">
            Спасибо за участие!
          </h1>
          <p className="text-blue-500 leading-relaxed text-base">
            Вы ответили на все вопросы опроса. Ваши ответы помогут нам лучше понять
            потребности наших пациентов и улучшить качество обслуживания.
          </p>

          <div className="mt-6 pt-5 border-t border-blue-50 flex items-center justify-center gap-6 text-sm text-blue-400">
            <div className="flex items-center gap-1.5">
              <Icon name="ClipboardList" size={14} />
              <span>{answers.length} ответов</span>
            </div>
            <div className="w-px h-4 bg-blue-100" />
            <div className="flex items-center gap-1.5">
              <Icon name="Shield" size={14} />
              <span>Данные защищены</span>
            </div>
          </div>
        </div>

        {/* Tips based on score */}
        <div className="bg-blue-50 rounded-2xl p-5 mb-8 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Lightbulb" size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Рекомендация</span>
          </div>
          <p className="text-sm text-blue-600 leading-relaxed">
            {score >= 75
              ? "Продолжайте в том же духе! Регулярный профилактический осмотр раз в полгода — лучшая стратегия для здоровья зубов."
              : score >= 50
              ? "Неплохой результат. Обратите внимание на использование зубной нити и регулярность визитов к стоматологу."
              : "Рекомендуем записаться на приём к стоматологу для профилактического осмотра и улучшить ежедневную гигиену."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onViewStats}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all duration-200 hover:scale-105"
          >
            <Icon name="BarChart2" size={16} />
            Посмотреть статистику
          </button>
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-blue-200 text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-all duration-200"
          >
            <Icon name="RotateCcw" size={16} />
            Пройти заново
          </button>
        </div>
      </div>

      {/* Decoratives */}
      <div className="fixed top-20 right-8 w-72 h-72 bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 left-8 w-56 h-56 bg-sky-100/30 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}