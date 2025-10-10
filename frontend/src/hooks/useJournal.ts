import { useCallback, useEffect, useState } from 'react';
import {
  analyzeJournalEntry,
  createJournalEntry,
  deleteJournalEntry,
  getDefaultPrompts,
  getDefaultTemplates,
  getJournalEntryById,
  getJournalPrompts,
  getJournalTemplates,
  updateJournalEntry,
} from '../services/journalService';
import { JournalEntry, JournalPrompt, JournalTemplate } from '../types';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';

export const useJournal = (userId: string) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [templates, setTemplates] = useState<JournalTemplate[]>([]);
  const [prompts, setPrompts] = useState<JournalPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load journal entries with real-time updates
  const loadEntries = useCallback(
    (limitCount: number = 50) => {
      if (!userId) return () => {};

      console.log('🔍 Setting up real-time journal entries listener for user:', userId);
      
      const journalRef = collection(db, 'journalEntries');
      const q = query(
        journalRef, 
        where('userId', '==', userId), 
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          console.log('📝 Journal entries updated:', querySnapshot.docs.length, 'entries');
          const journalEntries: JournalEntry[] = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            journalEntries.push({
              id: doc.id,
              userId: data.userId,
              title: data.title,
              content: data.content,
              date: data.date?.toDate() || new Date(),
              tags: data.tags || [],
              mood: data.mood,
              energy: data.energy,
              stress: data.stress,
              sleep: data.sleep,
              activities: data.activities || [],
              emotions: data.emotions || [],
              aiSuggestions: data.aiSuggestions || [],
              aiAnalysis: data.aiAnalysis,
              isPrivate: data.isPrivate || false,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            });
          });

          setEntries(journalEntries);
          setLoading(false);
        },
        (error) => {
          console.error('❌ Error in journal entries listener:', error);
          setError('Error loading journal entries');
          setLoading(false);
        }
      );

      return unsubscribe;
    },
    [userId]
  );

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const journalTemplates = await getJournalTemplates();
      
      // Always use default templates for now to avoid duplication
      const defaultTemplates = getDefaultTemplates();
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
      
      // Always use default prompts for now to avoid duplication
      const defaultPrompts = getDefaultPrompts();
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

      console.log('📝 Creating new journal entry...');

      // Analyze content with AI if provided
      let aiAnalysis;
      if (entryData.content && entryData.content.trim().length > 10) {
        console.log('🤖 Analyzing journal entry with AI...');
        aiAnalysis = await analyzeJournalEntry(entryData.content);
        console.log('✅ AI analysis completed:', aiAnalysis);
      }

      const newEntry = await createJournalEntry({
        ...entryData,
        aiAnalysis,
      });

      console.log('✅ Journal entry created successfully:', newEntry.id);
      
      // No need to manually update state - the listener will handle it
      return newEntry;
    } catch (err) {
      console.error('❌ Error creating journal entry:', err);
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

      console.log('📝 Updating journal entry:', entryId);

      // Re-analyze content if it was updated
      let aiAnalysis = updates.aiAnalysis;
      if (updates.content && updates.content.trim().length > 10) {
        console.log('🤖 Re-analyzing journal entry with AI...');
        aiAnalysis = await analyzeJournalEntry(updates.content);
        console.log('✅ AI re-analysis completed:', aiAnalysis);
      }

      await updateJournalEntry(entryId, {
        ...updates,
        aiAnalysis,
      });

      console.log('✅ Journal entry updated successfully');
      
      // No need to manually update state - the listener will handle it
    } catch (err) {
      console.error('❌ Error updating journal entry:', err);
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

      console.log('🗑️ Deleting journal entry:', entryId);
      
      await deleteJournalEntry(entryId);
      
      console.log('✅ Journal entry deleted successfully');
      
      // No need to manually update state - the listener will handle it
    } catch (err) {
      console.error('❌ Error deleting journal entry:', err);
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

  // Load data on mount with real-time listeners
  useEffect(() => {
    if (userId) {
      console.log('🚀 Initializing journal with real-time listeners for user:', userId);
      setLoading(true);
      
      // Set up real-time listener for journal entries
      const unsubscribeEntries = loadEntries();
      
      // Load templates and prompts (these don't need real-time updates)
      loadTemplates();
      loadPrompts();

      // Cleanup function
      return () => {
        console.log('🧹 Cleaning up journal listeners');
        if (unsubscribeEntries) {
          unsubscribeEntries();
        }
      };
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
