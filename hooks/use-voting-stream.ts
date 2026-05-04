'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface VoteUpdate {
  candidate_id: string;
  total_votes: number;
}

interface UseVotingStreamResult {
  voteCounts: Map<string, number>;
  connected: boolean;
  error: string | null;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY_MS = 1000;
const FALLBACK_POLL_INTERVAL_MS = 15000; // 15 seconds

export function useVotingStream(eventId: string): UseVotingStreamResult {
  const [voteCounts, setVoteCounts] = useState<Map<string, number>>(new Map());
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const esRef = useRef<EventSource | null>(null);

  // Fallback polling when SSE fails
  const startFallbackPolling = useCallback(() => {
    if (fallbackInterval.current) return;
    
    fallbackInterval.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/proxy/voting/events/${encodeURIComponent(eventId)}/results`);
        if (response.ok) {
          const data = await response.json();
          // Update vote counts from polling response
          if (data.candidates) {
            setVoteCounts(prev => {
              const next = new Map(prev);
              data.candidates.forEach((cand: { id: string; total_votes: number }) => {
                next.set(cand.id, cand.total_votes);
              });
              return next;
            });
          }
        }
      } catch {
        // Silently fail - we'll try again in the next interval
      }
    }, FALLBACK_POLL_INTERVAL_MS);
  }, [eventId]);

  const stopFallbackPolling = useCallback(() => {
    if (fallbackInterval.current) {
      clearInterval(fallbackInterval.current);
      fallbackInterval.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    // Close existing connection
    if (esRef.current) {
      esRef.current.close();
    }

    // Stop fallback polling when trying SSE
    stopFallbackPolling();

    const url = `/api/proxy/voting/events/${encodeURIComponent(eventId)}/stream`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('vote_update', (e: MessageEvent) => {
      try {
        const update: VoteUpdate = JSON.parse(e.data);
        setVoteCounts(prev => {
          const next = new Map(prev);
          next.set(update.candidate_id, update.total_votes);
          return next;
        });
      } catch {
        console.warn('[SSE] Failed to parse vote_update:', e.data);
      }
    });

    es.addEventListener('voting_closed', () => {
      setError('Voting has ended.');
      es.close();
      setConnected(false);
      stopFallbackPolling();
    });

    es.onopen = () => {
      setConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
    };

    es.onerror = () => {
      setConnected(false);
      es.close();

      if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
        setError('Live updates unavailable. Refreshing every 15s.');
        startFallbackPolling();
        return;
      }

      const delay = INITIAL_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts.current);
      reconnectAttempts.current += 1;
      reconnectTimeout.current = setTimeout(connect, delay);
    };
  }, [eventId, startFallbackPolling, stopFallbackPolling]);

  useEffect(() => {
    connect();
    
    return () => {
      esRef.current?.close();
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      stopFallbackPolling();
    };
  }, [connect, stopFallbackPolling]);

  return { voteCounts, connected, error };
}
