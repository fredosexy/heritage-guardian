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
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    if (!user) {
      setAlerts([]);
      setLoadError(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    syncAlerts(user.id, (key, vars) => String(t(key, vars as never)))
      .catch(() => alertsRepo.listAlerts(user.id))
      .then((data) => {
        if (!cancelled && data) setAlerts(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, t, reloadKey]);

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

  return { alerts, loading, loadError, reload, markRead };
}

export function useUnreadAlerts(limit = 5) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    if (!user) {
      setAlerts([]);
      setLoadError(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    alertsRepo
      .listUnreadAlerts(user.id, limit)
      .then((data) => {
        if (!cancelled) setAlerts(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, limit, reloadKey]);

  return { alerts, loading, loadError, reload };
}
