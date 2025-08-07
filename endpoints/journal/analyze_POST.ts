import { schema, OutputType } from "./analyze_POST.schema";

// ChatGPT API integration for task generation from journal analysis
const callChatGPTForTasks = async (tasks: string[]): Promise<string[]> => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  console.log('Generating subtasks for journal tasks:', tasks);
  console.log('OpenAI API Key available:', !!OPENAI_API_KEY);
  
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key not configured. Please add your API key to the .env file.');
  }

  const prompt = `Given these tasks from a student's journal: ${tasks.join(', ')}

Please break down each task into 3-5 specific, actionable subtasks that a student could follow. For each subtask, provide:
1. A clear description of what to do
2. Any materials or resources needed (if applicable)

Format the response as a JSON array with objects containing "task" and "subtasks" fields. Each subtask should have "description" and "materials" fields.

Example format:
[
  {
    "task": "Complete math homework",
    "subtasks": [
      {
        "description": "Read through the assignment requirements",
        "materials": "Assignment sheet, textbook"
      },
      {
        "description": "Solve the first 5 problems",
        "materials": "Calculator, paper, pen"
      },
      {
        "description": "Check answers and review mistakes",
        "materials": null
      }
    ]
  }
]

Make the subtasks specific to each task and appropriate for a student's level.`;

  try {
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
            content: 'You are a helpful assistant that breaks down student tasks into specific, actionable subtasks. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from ChatGPT');
    }

    console.log('ChatGPT response for subtasks:', content);

    // Parse the JSON response
    const result = JSON.parse(content);
    
    // Extract all subtasks
    const allSubtasks: string[] = [];
    if (Array.isArray(result)) {
      result.forEach((item: any) => {
        if (item.subtasks && Array.isArray(item.subtasks)) {
          item.subtasks.forEach((subtask: any) => {
            if (subtask.description) {
              allSubtasks.push(subtask.description);
            }
          });
        }
      });
    }

    return allSubtasks;
  } catch (error) {
    console.error('ChatGPT API error for subtasks:', error);
    throw new Error('Failed to generate subtasks with AI');
  }
};

// Simple keyword-based journal analysis
const analyzeJournalText = (text: string): OutputType => {
  const lowerText = text.toLowerCase();
  
  console.log('Analyzing journal text:', text.substring(0, 100) + '...');
  
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
  if (lowerText.includes('research')) tasks.push('Conduct research');
  if (lowerText.includes('read')) tasks.push('Read assigned materials');

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
  if (lowerText.includes('due')) {
    const task = tasks[0] || 'Complete task';
    deadlines[task] = 'soon';
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
  if (lowerText.includes('procrastination')) {
    obstacles.push('Procrastination');
  }
  if (lowerText.includes('difficult') || lowerText.includes('hard')) {
    obstacles.push('Task difficulty');
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

export async function handle(request: Request) {
  try {
    const body = await request.json();
    const validatedInput = schema.parse(body);
    
    console.log('Journal analysis request for text:', validatedInput.text.substring(0, 100) + '...');
    
    // First, analyze the journal text
    const analysisResult = analyzeJournalText(validatedInput.text);
    
    // If we found tasks, try to generate subtasks with ChatGPT
    if (analysisResult.tasks.length > 0) {
      try {
        const subtasks = await callChatGPTForTasks(analysisResult.tasks);
        console.log('Successfully generated subtasks with ChatGPT');
        
        // Update the schedule with the generated subtasks
        analysisResult.schedule = analysisResult.schedule.map((item, index) => ({
          ...item,
          subtasks: subtasks.slice(index * 3, (index + 1) * 3) || ['Break down task', 'Start with easiest part', 'Review progress']
        }));
      } catch (chatgptError) {
        console.warn('ChatGPT failed for subtasks, using default subtasks:', chatgptError);
        // Keep the default subtasks if ChatGPT fails
      }
    }
    
    return Response.json(analysisResult);
  } catch (error) {
    console.error('Journal analysis error:', error);
    return Response.json(
      { error: 'Failed to analyze journal' },
      { status: 400 }
    );
  }
}
