import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { alertsRepo } from "@/data";
import type { Alert } from "@/core/types/domain";
import { useAuth } from "@/features/identity";
import { syncAlerts } from "@/services";

export function useAlerts() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAlerts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    syncAlerts(user.id, (key, vars) => String(t(key, vars as never)))
      .catch(() => alertsRepo.listAlerts(user.id))
      .then((data) => {
        if (!cancelled && data) setAlerts(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, t]);

  const markRead = useCallback(async (id: string) => {
    const previous = alerts.find((alert) => alert.id === id);
    if (!previous || previous.read) return;

    setAlerts((current) => current.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)));
    try {
      await alertsRepo.markAlertRead(id);
    } catch (error) {
      setAlerts((current) => current.map((alert) => (
        alert.id === id ? { ...alert, read: previous.read } : alert
      )));
      throw error;
    }
  }, [alerts]);

  return { alerts, loading, markRead };
}

export function useUnreadAlerts(limit = 5) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAlerts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    alertsRepo
      .listUnreadAlerts(user.id, limit)
      .then((data) => {
        if (!cancelled) setAlerts(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, limit]);

  return { alerts, loading };
}
