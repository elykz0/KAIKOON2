import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCollectibles } from "../endpoints/collectibles_GET.schema";
import { postCollectiblesPurchase, InputType as PurchaseInput } from "../endpoints/collectibles/purchase_POST.schema";
import { getUserCollection } from "../endpoints/collectibles/user-collection_GET.schema";
import { useCurrentUserId } from "./useAuth";
import { toast } from "sonner";

export const useCollectibles = () => {
  return useQuery({
    queryKey: ["collectibles"],
    queryFn: () => getCollectibles(),
  });
};

export const useUserCollection = () => {
  const userId = useCurrentUserId();
  
  return useQuery({
    queryKey: ["userCollection"],
    queryFn: () => getUserCollection(undefined, userId),
  });
};

export const usePurchaseCollectible = () => {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();

  return useMutation({
    mutationFn: (purchaseData: PurchaseInput) => postCollectiblesPurchase(purchaseData, undefined, userId),
    onSuccess: (data, variables) => {
      toast.success("Purchase successful! ✨");
      // Invalidate and refetch data that has changed
      queryClient.invalidateQueries({ queryKey: ["userCollection"] });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    },
    onError: (error) => {
      toast.error(`Purchase failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
};