import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from './use-auth';

export function usePlayerFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['userPlayerFavorites', user?.id],
    queryFn: async () => {
      const res = await api.get<{ favorites: any[] }>('/players/user/favorites');
      return res.favorites || [];
    },
  });

  const favoritedIds = new Set(favorites.map((p: any) => (typeof p === 'string' ? p : p._id?.toString() || p.id)));

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (playerId: string) => {
      const res = await api.post<{ favorited: boolean }>(`/players/${playerId}/favorite`, {});
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPlayerFavorites'] });
      queryClient.invalidateQueries({ queryKey: ['explorePlayers'] });
    },
  });

  const isFavorited = (playerId: string) => favoritedIds.has(playerId);

  const toggleFavorite = (playerId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleFavoriteMutation.mutate(playerId);
  };

  return {
    favorites,
    favoritedIds,
    isLoading,
    isFavorited,
    toggleFavorite,
    isToggling: toggleFavoriteMutation.isPending,
  };
}
export default usePlayerFavorites;
