import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings } from "../endpoints/settings_GET.schema";
import { postSettings, type InputType as UpdateSettingsInput, type OutputType as SettingsType } from "../endpoints/settings_POST.schema";
import { postSettingsClearData } from "../endpoints/settings/clear-data_POST.schema";
import { useCurrentUserId } from "./useAuth";

const SETTINGS_QUERY_KEY = ['settings'];

export const useSettings = () => {
  const userId = useCurrentUserId();
  
  return useQuery(SETTINGS_QUERY_KEY, () => getSettings(), {
    // Provide mock data as fallback
    placeholderData: {
      id: 1,
      userId: userId || 1,
      grade: '12th Grade', // Default grade to prevent setup redirect
      classes: ['Math', 'Science', 'English'], // Default classes to prevent setup redirect
      hapticBuzz: true,
      soundEffects: true,
      notifications: true,
      theme: 'light',
      fontSize: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date(),
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();
  
  return useMutation({
    mutationFn: (updatedSettings: UpdateSettingsInput) => postSettings(updatedSettings, undefined, userId),
    onSuccess: (data) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, data);
    },
  });
};

export const useClearData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => postSettingsClearData(),
    onSuccess: () => {
      // Invalidate all user-specific data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });
};