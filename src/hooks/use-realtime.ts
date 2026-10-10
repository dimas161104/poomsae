'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtime<T>(
  table: string,
  options?: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string;
    callback?: (payload: T) => void;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes' as any,
        {
          event: options?.event || '*',
          schema: 'public',
          table: table,
          filter: options?.filter,
        },
        (payload: any) => {
          if (options?.callback) {
            options.callback(payload.new as T);
          }
          setData(prev => {
            const newRecord = payload.new as T & { id: string };
            const existing = prev.findIndex((item: any) => item.id === newRecord.id);
            if (payload.eventType === 'DELETE') {
              return prev.filter((item: any) => item.id !== (payload.old as any).id);
            }
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = newRecord;
              return updated;
            }
            return [...prev, newRecord];
          });
        }
      )
      .subscribe();

    setChannel(ch);

    return () => {
      supabase.removeChannel(ch);
    };
  }, [table, options?.event, options?.filter]);

  return { data, channel };
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [latency, setLatency] = useState<number>(0);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    const checkConnection = async () => {
      const start = Date.now();
      try {
        await supabase.from('settings').select('id').limit(1);
        if (isMounted) {
          setLatency(Date.now() - start);
          setStatus('connected');
        }
      } catch {
        if (isMounted) {
          setStatus('disconnected');
        }
      }
    };

    checkConnection();

    const interval = setInterval(checkConnection, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { status, latency };
}
