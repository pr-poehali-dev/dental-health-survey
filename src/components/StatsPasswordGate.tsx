import { useState } from "react";
import Icon from "@/components/ui/icon";

type Props = {
  onSuccess: () => void;
  onCancel: () => void;
};

const SECRET = "пароль";

export default function StatsPasswordGate({ onSuccess, onCancel }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === SECRET) {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className={`bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-50 p-8 ${shake ? "animate-shake" : ""}`}>
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Icon name="Lock" size={26} className="text-blue-600" />
          </div>

          <h2 className="text-xl font-bold text-blue-950 text-center mb-1">Доступ закрыт</h2>
          <p className="text-sm text-blue-400 text-center mb-6">Введите пароль для просмотра статистики</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(false); }}
              placeholder="Пароль"
              autoFocus
              className={`w-full px-4 py-3 rounded-2xl border-2 outline-none text-sm font-medium transition-all duration-200 bg-blue-50/50
                ${error
                  ? "border-red-300 text-red-700 placeholder:text-red-300"
                  : "border-blue-100 text-blue-900 placeholder:text-blue-300 focus:border-blue-400"
                }`}
            />
            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <Icon name="AlertCircle" size={12} />
                Неверный пароль
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all duration-200 hover:scale-105"
            >
              Войти
            </button>
          </form>

          <button
            onClick={onCancel}
            className="w-full mt-3 py-2 text-sm text-blue-400 hover:text-blue-600 transition-colors"
          >
            Отмена
          </button>
        </div>
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
  );
}
