import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postTasks } from '../endpoints/tasks_POST.schema';
import { postTasksGenerateSteps } from '../endpoints/tasks/generate-steps_POST.schema';
import { toast } from 'sonner';

export const useCreateTaskFromJournal = () => {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: { title: string; estimatedMinutes: number }) => {
      console.log('Creating task from journal:', taskData);
      // First, generate steps for the task
      const steps = await postTasksGenerateSteps({ title: taskData.title });
      console.log('Generated steps:', steps);
      
      // Then create the task with the generated steps
      const createdTask = await postTasks({
        title: taskData.title,
        estimatedMinutes: taskData.estimatedMinutes,
        steps: steps.map(step => ({
          description: step.description,
          materials: step.materials,
          completed: false
        }))
      });
      console.log('Created task:', createdTask);
      return createdTask;
    },
    onSuccess: (data) => {
      console.log('Task creation successful, invalidating queries');
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Also manually update the cache to ensure immediate update
      queryClient.setQueryData(['tasks'], (oldData: any[] | undefined) => {
        console.log('Old tasks data:', oldData);
        const newData = oldData ? [data, ...oldData] : [data];
        console.log('New tasks data:', newData);
        return newData;
      });
      toast.success('Task created successfully!');
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task. Please try again.');
    }
  });

  const createMultipleTasks = async (tasks: Array<{ title: string; estimatedMinutes: number }>) => {
    try {
      // Create tasks sequentially to avoid overwhelming the API
      for (const task of tasks) {
        await createTaskMutation.mutateAsync(task);
      }
      toast.success(`Created ${tasks.length} task${tasks.length !== 1 ? 's' : ''} from journal analysis!`);
    } catch (error) {
      console.error('Failed to create multiple tasks:', error);
      toast.error('Some tasks failed to create. Please try again.');
    }
  };

  return {
    createTask: createTaskMutation.mutate,
    createMultipleTasks,
    isCreating: createTaskMutation.isPending
  };
};
