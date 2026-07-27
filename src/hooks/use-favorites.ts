import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from './use-auth';

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['userFavorites', user?.id],
    queryFn: async () => {
      const res = await api.get<{ favorites: any[] }>('/teams/user/favorites');
      return res.favorites || [];
    },
  });

  const favoritedIds = new Set(favorites.map((t: any) => (typeof t === 'string' ? t : t._id?.toString() || t.id)));

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const res = await api.post<{ favorited: boolean }>(`/teams/${teamId}/favorite`, {});
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
      queryClient.invalidateQueries({ queryKey: ['exploreTeams'] });
      queryClient.invalidateQueries({ queryKey: ['manageTeams'] });
    },
  });

  const isFavorited = (teamId: string) => favoritedIds.has(teamId);

  const toggleFavorite = (teamId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleFavoriteMutation.mutate(teamId);
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
export default useFavorites;
