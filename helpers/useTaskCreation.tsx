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
      console.log('Task creation successful, updating cache');
      // Only use setQueryData to avoid double updates
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

  const createMultipleTasksMutation = useMutation({
    mutationFn: async (tasks: Array<{ title: string; estimatedMinutes: number }>) => {
      console.log('Creating multiple tasks from journal:', tasks);
      const createdTasks = [];
      
      // Create tasks sequentially to avoid overwhelming the API
      for (const task of tasks) {
        // First, generate steps for the task
        const steps = await postTasksGenerateSteps({ title: task.title });
        console.log('Generated steps for task:', task.title, steps);
        
        // Then create the task with the generated steps
        const createdTask = await postTasks({
          title: task.title,
          estimatedMinutes: task.estimatedMinutes,
          steps: steps.map(step => ({
            description: step.description,
            materials: step.materials,
            completed: false
          }))
        });
        console.log('Created task:', createdTask);
        createdTasks.push(createdTask);
      }
      
      return createdTasks;
    },
    onSuccess: (createdTasks) => {
      console.log('Multiple tasks created successfully, updating cache');
      // Update cache with all created tasks at once
      queryClient.setQueryData(['tasks'], (oldData: any[] | undefined) => {
        console.log('Old tasks data:', oldData);
        const newData = oldData ? [...createdTasks, ...oldData] : createdTasks;
        console.log('New tasks data:', newData);
        return newData;
      });
      toast.success(`Created ${createdTasks.length} task${createdTasks.length !== 1 ? 's' : ''} from journal analysis!`);
    },
    onError: (error) => {
      console.error('Failed to create multiple tasks:', error);
      toast.error('Some tasks failed to create. Please try again.');
    }
  });

  const createMultipleTasks = async (tasks: Array<{ title: string; estimatedMinutes: number }>) => {
    await createMultipleTasksMutation.mutateAsync(tasks);
  };

  return {
    createTask: createTaskMutation.mutate,
    createMultipleTasks,
    isCreating: createTaskMutation.isPending || createMultipleTasksMutation.isPending
  };
};
