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
      // Use invalidateQueries to ensure consistency and prevent duplicates
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
      console.log('Multiple tasks created successfully, invalidating queries');
      // Use invalidateQueries to ensure consistency and prevent duplicates
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
