// Auto-save hook for diary entries
import { useCallback, useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
  value: string;
  delay?: number;
  onSave?: (value: string) => void;
  enabled?: boolean;
}

export const useAutoSave = ({ value, delay = 2000, onSave, enabled = true }: UseAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  const save = useCallback(() => {
    if (value.trim() && value !== lastSavedRef.current && onSave) {
      onSave(value);
      lastSavedRef.current = value;
    }
  }, [value, onSave]);

  useEffect(() => {
    if (!enabled || !value.trim()) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(save, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, save, enabled]);

  // Save immediately when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (value.trim() && value !== lastSavedRef.current && onSave) {
        onSave(value);
      }
    };
  }, [value, onSave]);

  return { save };
};
