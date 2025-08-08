import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, type TaskWithSteps } from "../endpoints/tasks_GET.schema";
import { postTasks, type InputType as CreateTaskInput } from "../endpoints/tasks_POST.schema";
import { postTasksUpdate, type InputType as UpdateTaskInput } from "../endpoints/tasks/update_POST.schema";
import { getUserProgress } from "../endpoints/user-progress_GET.schema";
import { useCurrentUserId } from "./useAuth";

const TASKS_QUERY_KEY = ['tasks'];
const USER_PROGRESS_QUERY_KEY = ['userProgress'];

export const useTasks = () => {
  const userId = useCurrentUserId();
  
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: () => getTasks(undefined, userId),
  });
};

export const useUserProgress = () => {
  const userId = useCurrentUserId();
  
  return useQuery({
    queryKey: USER_PROGRESS_QUERY_KEY,
    queryFn: () => getUserProgress(undefined, userId),
    staleTime: 0, // Always refetch when invalidated
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();
  
  return useMutation({
    mutationFn: (newTask: CreateTaskInput) => postTasks(newTask, undefined, userId),
    onSuccess: (data) => {
      console.log('Task created successfully:', data);
      // Invalidate the query to refetch from storage (which includes the new task)
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();
  
  return useMutation({
    mutationFn: (updatedTask: UpdateTaskInput) => postTasksUpdate(updatedTask, undefined, userId),
    onSuccess: (data) => {
      // Invalidate both tasks and user progress as points might have changed
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_PROGRESS_QUERY_KEY });
    },
  });
};