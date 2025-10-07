import { useCallback, useEffect, useState } from 'react';
import {
  analyzeJournalEntry,
  createJournalEntry,
  deleteJournalEntry,
  getDefaultPrompts,
  getDefaultTemplates,
  getJournalEntries,
  getJournalEntryById,
  getJournalPrompts,
  getJournalTemplates,
  updateJournalEntry,
} from '../services/journalService';
import { JournalEntry, JournalPrompt, JournalTemplate } from '../types';

export const useJournal = (userId: string) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [templates, setTemplates] = useState<JournalTemplate[]>([]);
  const [prompts, setPrompts] = useState<JournalPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load journal entries
  const loadEntries = useCallback(
    async (limitCount: number = 10) => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);
        const journalEntries = await getJournalEntries(userId, limitCount);
        setEntries(journalEntries);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading journal entries');
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const journalTemplates = await getJournalTemplates();
      console.log('📋 Database templates:', journalTemplates.length);
      
      // Always use default templates for now to avoid duplication
      const defaultTemplates = getDefaultTemplates();
      console.log('📋 Default templates:', defaultTemplates.length);
      setTemplates(defaultTemplates);
    } catch (err) {
      console.error('❌ Error loading templates:', err);
      setError(err instanceof Error ? err.message : 'Error loading templates');
      // Fallback to default templates
      const defaultTemplates = getDefaultTemplates();
      setTemplates(defaultTemplates);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load prompts
  const loadPrompts = useCallback(async (category?: string) => {
    try {
      setLoading(true);
      setError(null);
      const journalPrompts = await getJournalPrompts(category);
      console.log('💡 Database prompts:', journalPrompts.length);
      
      // Always use default prompts for now to avoid duplication
      const defaultPrompts = getDefaultPrompts();
      console.log('💡 Default prompts:', defaultPrompts.length);
      setPrompts(defaultPrompts);
    } catch (err) {
      console.error('❌ Error loading prompts:', err);
      setError(err instanceof Error ? err.message : 'Error loading prompts');
      // Fallback to default prompts
      const defaultPrompts = getDefaultPrompts();
      setPrompts(defaultPrompts);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new journal entry
  const createEntry = useCallback(async (entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);

      // Analyze content with AI if provided
      let aiAnalysis;
      if (entryData.content && entryData.content.trim().length > 10) {
        aiAnalysis = await analyzeJournalEntry(entryData.content);
      }

      const newEntry = await createJournalEntry({
        ...entryData,
        aiAnalysis,
      });

      setEntries((prev) => [newEntry, ...prev]);
      return newEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating journal entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update journal entry
  const updateEntry = useCallback(async (entryId: string, updates: Partial<JournalEntry>) => {
    try {
      setLoading(true);
      setError(null);

      // Re-analyze content if it was updated
      let aiAnalysis = updates.aiAnalysis;
      if (updates.content && updates.content.trim().length > 10) {
        aiAnalysis = await analyzeJournalEntry(updates.content);
      }

      await updateJournalEntry(entryId, {
        ...updates,
        aiAnalysis,
      });

      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId ? { ...entry, ...updates, aiAnalysis, updatedAt: new Date() } : entry
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating journal entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete journal entry
  const deleteEntry = useCallback(async (entryId: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteJournalEntry(entryId);
      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting journal entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get journal entry by ID
  const getEntry = useCallback(async (entryId: string): Promise<JournalEntry | null> => {
    try {
      setLoading(true);
      setError(null);
      return await getJournalEntryById(entryId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting journal entry');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Analyze journal entry content
  const analyzeEntry = useCallback(async (content: string) => {
    try {
      setLoading(true);
      setError(null);
      return await analyzeJournalEntry(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analyzing journal entry');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get entries by date range
  const getEntriesByDateRange = useCallback(
    (startDate: Date, endDate: Date) => {
      return entries.filter((entry) => {
        const entryDate = entry.date;
        return entryDate >= startDate && entryDate <= endDate;
      });
    },
    [entries]
  );

  // Get entries by mood
  const getEntriesByMood = useCallback(
    (mood: number) => {
      return entries.filter((entry) => entry.mood === mood);
    },
    [entries]
  );

  // Get entries by tags
  const getEntriesByTags = useCallback(
    (tags: string[]) => {
      return entries.filter((entry) => tags.some((tag) => entry.tags.includes(tag)));
    },
    [entries]
  );

  // Get statistics
  const getJournalStats = useCallback(() => {
    const totalEntries = entries.length;
    const thisWeek = entries.filter((entry) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entry.date >= weekAgo;
    }).length;

    const averageMood =
      entries.length > 0 ? entries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / entries.length : 0;

    const mostUsedTags = entries
      .flatMap((entry) => entry.tags)
      .reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topTags = Object.entries(mostUsedTags)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    return {
      totalEntries,
      thisWeek,
      averageMood,
      topTags,
      streak: calculateStreak(),
    };
  }, [entries]);

  // Calculate writing streak
  const calculateStreak = useCallback(() => {
    if (entries.length === 0) return 0;

    const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (entryDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }, [entries]);

  // Load data on mount
  useEffect(() => {
    if (userId) {
      loadEntries();
      loadTemplates();
      loadPrompts();
    }
  }, [userId, loadEntries, loadTemplates, loadPrompts]);

  return {
    // State
    entries,
    templates,
    prompts,
    loading,
    error,

    // Actions
    createEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    analyzeEntry,
    loadEntries,
    loadTemplates,
    loadPrompts,

    // Utilities
    getEntriesByDateRange,
    getEntriesByMood,
    getEntriesByTags,
    getJournalStats,
    calculateStreak,
  };
};
