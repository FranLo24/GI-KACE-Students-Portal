import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';

const DEFAULT_INTERVAL_MS = 15000;

// Polls a form-config endpoint ('/form-config' or '/admin/form-config') so
// admin changes made from the Settings form builder (new/edited fields,
// sections, appearance) reach an already-open registration or students page
// without the user needing to refresh. State only updates when the fetched
// payload actually differs, so an unchanged config doesn't cause re-renders.
export function useFormConfig(endpoint, { intervalMs = DEFAULT_INTERVAL_MS, onUnauthorized } = {}) {
  const [formConfig, setFormConfig] = useState(null);
  const [error, setError] = useState(null);
  const lastPayloadRef = useRef('');
  const onUnauthorizedRef = useRef(onUnauthorized);

  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  }, [onUnauthorized]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get(endpoint);
        if (cancelled) return;
        const payload = JSON.stringify(res.data);
        if (payload !== lastPayloadRef.current) {
          lastPayloadRef.current = payload;
          setFormConfig(res.data);
        }
        setError(null);
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 401) {
          onUnauthorizedRef.current?.();
          return;
        }
        setError(err);
      }
    }

    load();
    const interval = setInterval(load, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [endpoint, intervalMs]);

  return { formConfig, error };
}
