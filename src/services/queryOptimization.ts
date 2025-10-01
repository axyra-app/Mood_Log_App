import {
  DocumentSnapshot,
  QueryConstraint,
  Unsubscribe,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore';
import { db } from './firebase';

// Cache para consultas
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpiar entradas expiradas
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Instancia global del cache
const queryCache = new QueryCache();

// Limpiar cache cada 10 minutos
setInterval(() => {
  queryCache.cleanup();
}, 10 * 60 * 1000);

// Generar clave única para consulta
const generateQueryKey = (collectionName: string, constraints: QueryConstraint[]): string => {
  const constraintStrings = constraints.map((c) => {
    if ('fieldPath' in c) {
      return `${c.fieldPath}:${c.opStr}:${c.value}`;
    }
    return c.toString();
  });
  return `${collectionName}:${constraintStrings.join('|')}`;
};

// Paginación para consultas grandes
export interface PaginationOptions {
  pageSize: number;
  startAfter?: DocumentSnapshot;
  orderByField: string;
  orderDirection: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
  totalCount?: number;
}

// Hook para consultas paginadas
export const usePaginatedQuery = <T>(
  collectionName: string,
  baseConstraints: QueryConstraint[] = [],
  options: PaginationOptions
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);

      const constraints = [
        ...baseConstraints,
        orderBy(options.orderByField, options.orderDirection),
        limit(options.pageSize),
        ...(lastDoc ? [startAfter(lastDoc)] : []),
      ];

      const q = query(collection(db, collectionName), ...constraints);
      const snapshot = await getDocs(q);

      const newData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      setData((prev) => [...prev, ...newData]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === options.pageSize);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [collectionName, baseConstraints, options, lastDoc, loading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setLastDoc(null);
    setHasMore(true);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  };
};

// Hook para consultas con cache
export const useCachedQuery = <T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  ttl: number = 5 * 60 * 1000
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryKey = generateQueryKey(collectionName, constraints);

  const fetchData = useCallback(async () => {
    // Verificar cache primero
    const cachedData = queryCache.get(queryKey);
    if (cachedData) {
      setData(cachedData);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const q = query(collection(db, collectionName), ...constraints);
      const snapshot = await getDocs(q);

      const result = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      // Guardar en cache
      queryCache.set(queryKey, result, ttl);
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [collectionName, constraints, queryKey, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    queryCache.clear();
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

// Hook para consultas en tiempo real optimizadas
export const useOptimizedRealtimeQuery = <T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options: {
    enabled?: boolean;
    throttleMs?: number;
  } = {}
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const { enabled = true, throttleMs = 1000 } = options;

  useEffect(() => {
    if (!enabled) return;

    const setupListener = () => {
      try {
        const q = query(collection(db, collectionName), ...constraints);

        unsubscribeRef.current = onSnapshot(
          q,
          (snapshot) => {
            const now = Date.now();

            // Throttle updates para evitar demasiados re-renders
            if (now - lastUpdateRef.current < throttleMs) {
              return;
            }

            lastUpdateRef.current = now;

            const result = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as T[];

            setData(result);
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.error('Realtime query error:', err);
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [collectionName, constraints, enabled, throttleMs]);

  return {
    data,
    loading,
    error,
  };
};

// Hook para consultas batch (múltiples documentos)
export const useBatchQuery = <T>(
  queries: Array<{
    collectionName: string;
    docId: string;
  }>
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const promises = queries.map(async ({ collectionName, docId }) => {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data(),
          } as T;
        }
        return null;
      });

      const results = await Promise.all(promises);
      setData(results.filter(Boolean) as T[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [queries]);

  useEffect(() => {
    if (queries.length > 0) {
      fetchBatch();
    }
  }, [fetchBatch]);

  return {
    data,
    loading,
    error,
    refetch: fetchBatch,
  };
};

// Utilidades para optimización
export const queryOptimization = {
  // Prefetch de datos comunes
  prefetchCommonData: async () => {
    const commonQueries = [
      { collection: 'users', constraints: [limit(10)] },
      { collection: 'moodLogs', constraints: [orderBy('createdAt', 'desc'), limit(20)] },
    ];

    const promises = commonQueries.map(async ({ collection, constraints }) => {
      const q = query(collection(db, collection), ...constraints);
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const queryKey = generateQueryKey(collection, constraints);
      queryCache.set(queryKey, data, 10 * 60 * 1000); // Cache por 10 minutos

      return data;
    });

    await Promise.all(promises);
  },

  // Limpiar cache específico
  clearCacheForCollection: (collectionName: string) => {
    // Implementación simplificada - en producción usaría un sistema más sofisticado
    queryCache.clear();
  },

  // Obtener estadísticas del cache
  getCacheStats: () => {
    return {
      size: queryCache['cache'].size,
      // Más estadísticas podrían agregarse aquí
    };
  },
};

export default queryOptimization;
