import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "../../api";
import type { Photo } from "../types";

export const PhotoDetailsQueryKeys = ["photoDetails"] as const;

export const useFetchPhotoDetailsQuery = (hash: string) =>
  useQuery({
    queryKey: [...PhotoDetailsQueryKeys, hash],
    queryFn: async () => {
      if (!hash) {
        return null;
      }
      const response = await fetchClient.get(`/photos/${hash}/`);
      return response as Photo;
    },
    // Aggressive garbage collection for photo details to prevent memory leaks
    // when viewing many photos in succession (e.g., during face identification)
    gcTime: 30 * 1000, // 30 seconds
  });
