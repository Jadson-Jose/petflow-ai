"use client";

import { useState } from "react";
import { Brain, Sparkles, TrendingUp, User, Loader2, Play } from "lucide-react";
import { motion } from "framer-motion";

import { Modal } from "@/components/modal";
import {
  useMLModels,
  usePredictChurn,
  usePredictions,
  type ChurnPrediction,
} from "@/hooks/use-ai";
import { useOwners } from "@/hooks/use-owners";

// Variantes de animação
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function riskLevel(probability: number) {
  if (probability >= 0.7) return { label: "Alto", className: "bg-red-100 text-red-700 ring-1 ring-red-200" };
  if (probability >= 0.4) return { label: "Médio", className: "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200" };
  return { label: "Baixo", className: "bg-green-100 text-green-700 ring-1 ring-green-200" };
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
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
    <motion.div 
      className="space-y-8 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            Inteligência Artificial
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Predições de churn e inteligência operacional
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/30 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Nova Predição
        </motion.button>
      </motion.div>

      {/* Cards de resumo */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1 */}
        <motion.div whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 transition-all">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-slate-500">Total de Predições</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{predictions?.count ?? 0}</p>
        </motion.div>

        {/* Card 2 */}
        <motion.div whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 transition-all">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <User className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-sm font-medium text-slate-500">Clientes em Alto Risco</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {(predictions?.results ?? []).filter((p) => p.probability >= 0.7).length}
          </p>
        </motion.div>

        {/* Card 3 */}
        <motion.div whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 transition-all">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-slate-500">Modelos Ativos</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{models?.count ?? 0}</p>
        </motion.div>
      </motion.div>

      {/* Lista de predições */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-base font-semibold text-slate-900">
            Histórico de Predições
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
        ) : (predictions?.results ?? []).length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">Nenhuma predição gerada ainda.</p>
            <p className="text-sm text-slate-400 mt-1">
              Clique em "Nova Predição" para analisar o risco de abandono de um tutor.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Tutor</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Probabilidade</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Risco</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Modelo</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(predictions?.results ?? []).map((pred: ChurnPrediction) => {
                  const risk = riskLevel(pred.probability);
                  return (
                    <tr key={pred.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{pred.owner_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{(pred.probability * 100).toFixed(1)}%</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${risk.className}`}>
                          {risk.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{pred.model_name || "—"}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(pred.predicted_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal (Mantido o mesmo, mas com animação) */}
      <Modal open={isModalOpen} onClose={() => setModalOpen(false)} title="Nova Predição de Churn">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Selecione o tutor</label>
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white transition-all shadow-sm"
            >
              <option value="">Selecione um tutor...</option>
              {(ownersData?.results ?? []).map((owner) => (
                <option key={owner.id} value={owner.id}>{owner.full_name} — {owner.email}</option>
              ))}
            </select>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <p className="text-xs text-purple-800 leading-relaxed">
              <strong>Como funciona:</strong> Analisamos o histórico de agendamentos do tutor (frequência, recência, cancelamentos) para estimar o risco de abandono. A predição roda em background via Celery.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              Cancelar
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handlePredict}
              disabled={!selectedOwner || predictMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-xl shadow-md shadow-purple-500/20 transition-all"
            >
              {predictMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analisando...</>
              ) : (
                <><Play className="w-4 h-4" /> Gerar Predição</>
              )}
            </motion.button>
          </div>
        </motion.div>
      </Modal>
    </motion.div>
  );
}