import { useState } from "react";
import SurveyPage from "@/components/SurveyPage";
import ThankYouPage from "@/components/ThankYouPage";
import StatisticsPanel from "@/components/StatisticsPanel";
import StatsPasswordGate from "@/components/StatsPasswordGate";

export type Answer = {
  questionId: number;
  optionIndex: number;
};

export type SurveyState = "survey" | "thankyou" | "password" | "stats";

export default function Index() {
  const [state, setState] = useState<SurveyState>("survey");
  const [answers, setAnswers] = useState<Answer[]>([]);

  const handleComplete = (finalAnswers: Answer[]) => {
    setAnswers(finalAnswers);
    setState("thankyou");
  };

  const handleViewStats = () => setState("password");
  const handleRestart = () => {
    setAnswers([]);
    setState("survey");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 font-golos">
      {state === "survey" && (
        <SurveyPage onComplete={handleComplete} onViewStats={handleViewStats} />
      )}
      {state === "thankyou" && (
        <ThankYouPage
          answers={answers}
          onViewStats={handleViewStats}
          onRestart={handleRestart}
        />
      )}
      {state === "password" && (
        <StatsPasswordGate
          onSuccess={() => setState("stats")}
          onCancel={() => setState("thankyou")}
        />
      )}
      {state === "stats" && (
        <StatisticsPanel
          answers={answers}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}