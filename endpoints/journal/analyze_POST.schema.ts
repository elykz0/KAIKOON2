import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  text: z.string().min(1, "Journal text cannot be empty."),
});

export type InputType = z.infer<typeof schema>;

export type Task = {
  description: string;
  materials: string | null;
};

export type OutputType = {
  tasks: string[];
  deadlines: Record<string, string>;
  obstacles: string[];
  schedule: Array<{
    task: string;
    start: string;
    end: string;
    deadline: string;
    subtasks: string[];
  }>;
  obstacle_strategies: Array<{
    obstacle: string;
    strategies: string[];
  }>;
  feedback_summary: string;
};

export const postJournalAnalyze = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  
  console.log('Analyzing journal text:', validatedInput.text.substring(0, 100) + '...');
  
  // Try ChatGPT first if API key is available
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') {
    try {
      console.log('Attempting ChatGPT integration for journal analysis...');
      
      const prompt = `Analyze this journal entry and extract tasks, deadlines, and obstacles:

"${validatedInput.text}"

Please provide a JSON response with the following structure:
{
  "tasks": ["task1", "task2", "task3"],
  "deadlines": {"task1": "deadline1", "task2": "deadline2"},
  "obstacles": ["obstacle1", "obstacle2"],
  "schedule": [
    {
      "task": "task1",
      "start": "09:00 AM",
      "end": "10:00 AM", 
      "deadline": "deadline1",
      "subtasks": ["subtask1", "subtask2", "subtask3"]
    }
  ],
  "obstacle_strategies": [
    {
      "obstacle": "obstacle1",
      "strategies": ["strategy1", "strategy2"]
    }
  ],
  "feedback_summary": "Summary of analysis"
}

Extract specific, actionable tasks from the journal entry. Include deadlines if mentioned. Identify obstacles and provide strategies to overcome them.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that analyzes journal entries to identify tasks, deadlines, and obstacles. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        if (content) {
          try {
            const analysis = JSON.parse(content);
            return {
              tasks: analysis.tasks || [],
              deadlines: analysis.deadlines || {},
              obstacles: analysis.obstacles || [],
              schedule: analysis.schedule || [],
              obstacle_strategies: analysis.obstacle_strategies || [],
              feedback_summary: analysis.feedback_summary || `I found ${analysis.tasks?.length || 0} tasks in your journal entry.`
            };
          } catch (parseError) {
            console.warn('Failed to parse ChatGPT response:', parseError);
          }
        }
      }
    } catch (error) {
      console.warn('ChatGPT integration failed for journal analysis, using fallback:', error);
    }
  } else {
    console.log('OpenAI API key not configured for journal analysis, using fallback');
  }
  
  // Fallback to keyword-based analysis
  const lowerText = validatedInput.text.toLowerCase();
  
  // Extract tasks
  const tasks: string[] = [];
  if (lowerText.includes('homework')) tasks.push('Complete homework');
  if (lowerText.includes('project')) tasks.push('Finish project');
  if (lowerText.includes('study')) tasks.push('Study for exam');
  if (lowerText.includes('essay')) tasks.push('Write essay');
  if (lowerText.includes('assignment')) tasks.push('Complete assignment');
  if (lowerText.includes('exam')) tasks.push('Study for exam');
  if (lowerText.includes('test')) tasks.push('Prepare for test');
  if (lowerText.includes('presentation')) tasks.push('Prepare presentation');

  // Extract deadlines
  const deadlines: Record<string, string> = {};
  if (lowerText.includes('tomorrow')) {
    const task = tasks[0] || 'Complete task';
    deadlines[task] = 'tomorrow';
  }
  if (lowerText.includes('friday')) {
    const task = tasks[0] || 'Complete task';
    deadlines[task] = 'friday';
  }
  if (lowerText.includes('next week')) {
    const task = tasks[0] || 'Complete task';
    deadlines[task] = 'next week';
  }
  if (lowerText.includes('this weekend')) {
    const task = tasks[0] || 'Complete task';
    deadlines[task] = 'this weekend';
  }

  // Extract obstacles
  const obstacles: string[] = [];
  if (lowerText.includes('distracted') || lowerText.includes('phone')) {
    obstacles.push('Phone distractions');
  }
  if (lowerText.includes('noise') || lowerText.includes('siblings')) {
    obstacles.push('Environmental noise');
  }
  if (lowerText.includes('motivation') || lowerText.includes('overwhelmed')) {
    obstacles.push('Lack of motivation');
  }
  if (lowerText.includes('time') || lowerText.includes('busy')) {
    obstacles.push('Time management');
  }
  if (lowerText.includes('stress') || lowerText.includes('anxiety')) {
    obstacles.push('Stress and anxiety');
  }

  const schedule = tasks.map(task => ({
    task,
    start: '09:00 AM',
    end: '10:00 AM',
    deadline: deadlines[task] || 'No deadline',
    subtasks: ['Break down task', 'Start with easiest part', 'Review progress']
  }));

  const obstacle_strategies = obstacles.map(obstacle => ({
    obstacle,
    strategies: ['Use focus techniques', 'Create a quiet workspace', 'Set specific time blocks']
  }));

  return {
    tasks,
    deadlines,
    obstacles,
    schedule,
    obstacle_strategies,
    feedback_summary: `I found ${tasks.length} tasks in your journal entry. ${obstacles.length > 0 ? `You mentioned ${obstacles.length} obstacles that we can address.` : ''}`
  };
};
