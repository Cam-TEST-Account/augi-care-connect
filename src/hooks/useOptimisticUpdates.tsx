import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OptimisticUpdate<T> {
  id: string;
  data: T;
  pending: boolean;
  error?: string;
}

interface UseOptimisticUpdatesOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string, data: T) => void;
  revertOnError?: boolean;
}

export const useOptimisticUpdates = <T,>(
  initialData: T[],
  options: UseOptimisticUpdatesOptions<T> = {}
) => {
  const [data, setData] = useState<T[]>(initialData);
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, OptimisticUpdate<T>>>(new Map());
  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const optimisticAdd = useCallback(async (
    newItem: T,
    asyncFn: () => Promise<T>,
    idField: keyof T = 'id' as keyof T
  ) => {
    const tempId = generateId();
    const optimisticItem = { ...newItem, [idField]: tempId } as T;
    
    // Immediately add to UI
    setData(prev => [optimisticItem, ...prev]);
    setPendingUpdates(prev => new Map(prev.set(tempId, {
      id: tempId,
      data: optimisticItem,
      pending: true,
    })));

    try {
      const result = await asyncFn();
      
      // Replace optimistic item with real data
      setData(prev => 
        prev.map(item => 
          (item as any)[idField] === tempId ? result : item
        )
      );
      
      setPendingUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });
      
      options.onSuccess?.(result);
      
      return result;
    } catch (error) {
      // Remove optimistic item on error
      setData(prev => prev.filter(item => (item as any)[idField] !== tempId));
      
      setPendingUpdates(prev => {
        const newMap = new Map(prev);
        newMap.set(tempId, {
          id: tempId,
          data: optimisticItem,
          pending: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        });
        return newMap;
      });

      const errorMessage = error instanceof Error ? error.message : 'Failed to save';
      options.onError?.(errorMessage, optimisticItem);
      
      toast({
        title: 'Error',
        description: `Failed to add item: ${errorMessage}`,
        variant: 'destructive',
      });
      
      throw error;
    }
  }, [options, toast]);

  const optimisticUpdate = useCallback(async (
    id: string | number,
    updates: Partial<T>,
    asyncFn: () => Promise<T>,
    idField: keyof T = 'id' as keyof T
  ) => {
    const originalItem = data.find(item => (item as any)[idField] === id);
    if (!originalItem) throw new Error('Item not found');
    
    const optimisticItem = { ...originalItem, ...updates };
    
    // Immediately update UI
    setData(prev =>
      prev.map(item =>
        (item as any)[idField] === id ? optimisticItem : item
      )
    );
    
    setPendingUpdates(prev => new Map(prev.set(String(id), {
      id: String(id),
      data: optimisticItem,
      pending: true,
    })));

    try {
      const result = await asyncFn();
      
      // Replace with server response
      setData(prev =>
        prev.map(item =>
          (item as any)[idField] === id ? result : item
        )
      );
      
      setPendingUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(String(id));
        return newMap;
      });
      
      options.onSuccess?.(result);
      
      return result;
    } catch (error) {
      // Revert to original on error
      if (options.revertOnError !== false) {
        setData(prev =>
          prev.map(item =>
            (item as any)[idField] === id ? originalItem : item
          )
        );
      }
      
      setPendingUpdates(prev => {
        const newMap = new Map(prev);
        newMap.set(String(id), {
          id: String(id),
          data: originalItem,
          pending: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        });
        return newMap;
      });

      const errorMessage = error instanceof Error ? error.message : 'Failed to update';
      options.onError?.(errorMessage, optimisticItem);
      
      toast({
        title: 'Error',
        description: `Failed to update: ${errorMessage}`,
        variant: 'destructive',
      });
      
      throw error;
    }
  }, [data, options, toast]);

  const optimisticDelete = useCallback(async (
    id: string | number,
    asyncFn: () => Promise<void>,
    idField: keyof T = 'id' as keyof T
  ) => {
    const originalItem = data.find(item => (item as any)[idField] === id);
    if (!originalItem) throw new Error('Item not found');
    
    // Immediately remove from UI
    setData(prev => prev.filter(item => (item as any)[idField] !== id));
    
    setPendingUpdates(prev => new Map(prev.set(String(id), {
      id: String(id),
      data: originalItem,
      pending: true,
    })));

    try {
      await asyncFn();
      
      setPendingUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(String(id));
        return newMap;
      });
      
      toast({
        title: 'Deleted',
        description: 'Item has been removed',
      });
      
    } catch (error) {
      // Restore item on error
      setData(prev => [originalItem, ...prev]);
      
      setPendingUpdates(prev => {
        const newMap = new Map(prev);
        newMap.set(String(id), {
          id: String(id),
          data: originalItem,
          pending: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        });
        return newMap;
      });

      const errorMessage = error instanceof Error ? error.message : 'Failed to delete';
      options.onError?.(errorMessage, originalItem);
      
      toast({
        title: 'Error',
        description: `Failed to delete: ${errorMessage}`,
        variant: 'destructive',
      });
      
      throw error;
    }
  }, [data, options, toast]);

  const isPending = useCallback((id: string | number) => {
    return pendingUpdates.get(String(id))?.pending ?? false;
  }, [pendingUpdates]);

  const getError = useCallback((id: string | number) => {
    return pendingUpdates.get(String(id))?.error;
  }, [pendingUpdates]);

  const clearError = useCallback((id: string | number) => {
    setPendingUpdates(prev => {
      const newMap = new Map(prev);
      const update = newMap.get(String(id));
      if (update) {
        newMap.set(String(id), { ...update, error: undefined });
      }
      return newMap;
    });
  }, []);

  const retry = useCallback((id: string | number, asyncFn: () => Promise<any>) => {
    const update = pendingUpdates.get(String(id));
    if (!update || !update.error) return;
    
    setPendingUpdates(prev => new Map(prev.set(String(id), {
      ...update,
      pending: true,
      error: undefined,
    })));
    
    return asyncFn().catch((error) => {
      setPendingUpdates(prev => new Map(prev.set(String(id), {
        ...update,
        pending: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      })));
      throw error;
    });
  }, [pendingUpdates]);

  return {
    data,
    optimisticAdd,
    optimisticUpdate,
    optimisticDelete,
    isPending,
    getError,
    clearError,
    retry,
    pendingCount: pendingUpdates.size,
  };
};