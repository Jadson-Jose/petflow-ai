"use client";

import { Crown, Loader2 } from "lucide-react";

import { PlanCard } from "@/components/plan-card";
import {
  useMySubscription,
  usePlans,
  useStartTrial,
  useUpgradePlan,
} from "@/hooks/use-plans";

export default function PlansPage() {
  const { data: plansData, isLoading: loadingPlans } = usePlans();
  const { data: subscription, isLoading: loadingSub } = useMySubscription();

  const startTrial = useStartTrial();
  const upgrade = useUpgradePlan();

  const plans = plansData?.results ?? [];
  const currentSlug = subscription?.plan_slug;

  const handleSelect = (planSlug: string) => {
    const plan = plans.find((p) => p.slug === planSlug);
    if (!plan) return;

    const isFree = plan.is_free;

    if (isFree) {
      if (confirm(`Mudar para o plano ${plan.name}?`)) {
        upgrade.mutate(planSlug);
      }
      return;
    }

    // Se o tenant nunca fez trial E o plano não é o atual
    const canStartTrial =
      !subscription?.trial_start && subscription?.plan_slug !== planSlug;

    if (canStartTrial && plan.trial_days > 0) {
      if (
        confirm(
          `Iniciar ${plan.trial_days} dias grátis no plano ${plan.name}?`
        )
      ) {
        startTrial.mutate(planSlug);
      }
    } else {
      if (confirm(`Mudar para o plano ${plan.name} (R$ ${plan.price_monthly}/mês)?`)) {
        upgrade.mutate(planSlug);
      }
    }
  };

  const isPending = startTrial.isPending || upgrade.isPending;

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <Crown className="w-3 h-3" />
          Planos
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Escolha o plano ideal para o seu negócio
        </h1>
        <p className="text-gray-500 mt-2">
          Comece grátis e evolua conforme sua operação cresce. Sem fidelidade,
          cancele quando quiser.
        </p>
      </div>

      {loadingPlans || loadingSub ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={plan.slug === currentSlug}
              isPopular={plan.slug === "silver"}
              onSelect={handleSelect}
              selectLabel={
                plan.slug === "free"
                  ? "Mudar para Free"
                  : !subscription?.trial_start && plan.trial_days > 0
                    ? `Testar ${plan.trial_days} dias grátis`
                    : "Escolher plano"
              }
              disabled={isPending}
            />
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 max-w-3xl mx-auto">
        <h3 className="font-semibold text-blue-900 mb-2">
          💡 Sobre os planos
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Você pode começar grátis e fazer upgrade quando quiser.</li>
          <li>• Trial de 14 dias em qualquer plano pago (uma vez por conta).</li>
          <li>• Cancele quando quiser — sem multa ou fidelidade.</li>
          <li>• Todos os planos incluem suporte por e-mail.</li>
        </ul>
      </div>
    </div>
  );
}
