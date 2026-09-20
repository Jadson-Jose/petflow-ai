"use client";

import { Mail, MessageCircle, Bell, CheckCircle2, XCircle, Clock } from "lucide-react";

import { useNotifications } from "@/hooks/use-notifications";
import type { Notification } from "@/types/api";

const channelIcons = {
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
  SYSTEM: Bell,
};

const channelLabels = {
  EMAIL: "E-mail",
  WHATSAPP: "WhatsApp",
  SYSTEM: "Sistema",
};

const statusConfig = {
  PENDING: {
    label: "Pendente",
    className: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  SENT: {
    label: "Enviado",
    className: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Falhou",
    className: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
        <p className="text-sm text-gray-500">
          {data?.count ?? 0} notificação(ões) enviada(s)
        </p>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 py-12">Carregando...</div>
      ) : (data?.results ?? []).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma notificação enviada ainda.</p>
          <p className="text-xs text-gray-400 mt-1">
            As notificações de lembretes de agendamento e alertas aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(data?.results ?? []).map((notification: Notification) => {
            const ChannelIcon = channelIcons[notification.channel] ?? Bell;
            const status = statusConfig[notification.status] ?? statusConfig.PENDING;
            const StatusIcon = status.icon;

            return (
              <div
                key={notification.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <ChannelIcon className="w-5 h-5 text-green-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {notification.subject}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${status.className}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {notification.body}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <ChannelIcon className="w-3 h-3" />
                        {channelLabels[notification.channel]}
                      </span>
                      <span>Para: {notification.recipient_email ?? "—"}</span>
                      <span>{formatDate(notification.created_at)}</span>
                    </div>

                    {notification.error_message && (
                      <p className="text-xs text-red-500 mt-2">
                        Erro: {notification.error_message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
