"use client";

import { useState } from "react";
import { Brain, Sparkles, TrendingUp, User, Loader2, Play } from "lucide-react";

import { Modal } from "@/components/modal";
import {
  useMLModels,
  usePredictChurn,
  usePredictions,
  type ChurnPrediction,
} from "@/hooks/use-ai";
import { useOwners } from "@/hooks/use-owners";

function riskLevel(probability: number) {
  if (probability >= 0.7) return { label: "Alto", className: "bg-red-100 text-red-700" };
  if (probability >= 0.4) return { label: "Médio", className: "bg-yellow-100 text-yellow-700" };
  return { label: "Baixo", className: "bg-green-100 text-green-700" };
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AIPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState("");

  const { data: predictions, isLoading } = usePredictions();
  const { data: models } = useMLModels();
  const { data: ownersData } = useOwners();
  const predictMutation = usePredictChurn();

  const handlePredict = () => {
    if (!selectedOwner) return;
    predictMutation.mutate(selectedOwner, {
      onSuccess: () => {
        setModalOpen(false);
        setSelectedOwner("");
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            Inteligência Artificial
          </h1>
          <p className="text-sm text-gray-500">
            Predições de churn e inteligência operacional
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          <Sparkles className="w-4 h-4" />
          Nova Predição
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500">Predições</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {predictions?.count ?? 0}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <User className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm text-gray-500">Alto risco</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {(predictions?.results ?? []).filter((p) => p.probability >= 0.7).length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">Modelos</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {models?.count ?? 0}
          </p>
        </div>
      </div>

      {/* Lista de predições */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Predições recentes
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : (predictions?.results ?? []).length === 0 ? (
          <div className="p-12 text-center">
            <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              Nenhuma predição gerada ainda.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Clique em &quot;Nova Predição&quot; para analisar o risco de
              abandono de um tutor.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Tutor
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Probabilidade
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Risco
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Modelo
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {(predictions?.results ?? []).map((pred: ChurnPrediction) => {
                const risk = riskLevel(pred.probability);
                return (
                  <tr
                    key={pred.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition"
                  >
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">
                      {pred.owner_name}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {(pred.probability * 100).toFixed(1)}%
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${risk.className}`}
                      >
                        {risk.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {pred.model_name || "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {formatDate(pred.predicted_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de nova predição */}
      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova Predição de Churn"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecione o tutor
            </label>
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">Selecione um tutor...</option>
              {(ownersData?.results ?? []).map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.full_name} — {owner.email}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-gray-500 bg-purple-50 p-3 rounded-lg">
            <strong>Como funciona:</strong> Analisamos o histórico de agendamentos
            do tutor (frequência, recência, cancelamentos) para estimar o risco
            de abandono. A predição roda em background via Celery.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handlePredict}
              disabled={!selectedOwner || predictMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition"
            >
              {predictMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Gerar Predição
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
