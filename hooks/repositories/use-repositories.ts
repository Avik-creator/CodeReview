"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchRepositories } from "@/app/actions/repository";

export const useRepositories = () => {
  return useInfiniteQuery({
    queryKey: ["repositories"],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const data = await fetchRepositories(pageParam, 10);
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 10) return undefined;
      return allPages.length + 1;
    },
    refetchOnWindowFocus: false,
  });
};
