import { schema, OutputType } from "./generate-steps_POST.schema";

// ChatGPT API integration for server-side
const callChatGPT = async (taskTitle: string): Promise<OutputType> => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  console.log('Server-side ChatGPT call for task:', taskTitle);
  console.log('OpenAI API Key available:', !!OPENAI_API_KEY);
  
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key not configured. Please add your API key to the .env file.');
  }

  const prompt = `Given this task: "${taskTitle}", please break it down into 3-6 specific, actionable steps that a student could follow. For each step, provide:
1. A clear description of what to do
2. Any materials or resources needed (if applicable)

Format the response as a JSON array with objects containing "description" and "materials" fields. The materials field should be null if no specific materials are needed.

Example format:
[
  {
    "description": "Gather all necessary materials",
    "materials": "Textbook, calculator, paper, pen"
  },
  {
    "description": "Read the assignment requirements carefully",
    "materials": null
  }
]

Make the steps specific to the task and appropriate for a student's level.`;

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
            content: 'You are a helpful assistant that breaks down tasks into specific, actionable steps for students. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
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

    console.log('ChatGPT response:', content);

    // Parse the JSON response
    const steps = JSON.parse(content);
    
    // Validate the response format
    if (!Array.isArray(steps)) {
      throw new Error('Invalid response format from ChatGPT');
    }

    return steps.map((step: any) => ({
      description: step.description || 'Complete this step',
      materials: step.materials || null,
    }));
  } catch (error) {
    console.error('ChatGPT API error:', error);
    throw new Error('Failed to generate steps with AI');
  }
};

// Generate contextual mock data based on task type
const generateContextualSteps = (taskTitle: string): OutputType => {
  const taskTitleLower = taskTitle.toLowerCase();
  
  console.log('Generating contextual steps for task:', taskTitle);
  
  if (taskTitleLower.includes('homework') || taskTitleLower.includes('assignment')) {
    return [
      {
        description: "Read through the assignment requirements carefully",
        materials: "Assignment sheet, rubric"
      },
      {
        description: "Gather all necessary materials and resources",
        materials: "Textbook, calculator, paper, pen"
      },
      {
        description: "Break down the assignment into smaller sections",
        materials: null
      },
      {
        description: "Start with the easiest or most familiar section first",
        materials: null
      },
      {
        description: "Review and double-check your work before submitting",
        materials: null
      }
    ];
  } else if (taskTitleLower.includes('study') || taskTitleLower.includes('review')) {
    return [
      {
        description: "Organize your study materials and notes",
        materials: "Notes, textbook, highlighters, flashcards"
      },
      {
        description: "Create a study schedule with specific time blocks",
        materials: "Calendar, timer"
      },
      {
        description: "Start with the most challenging topics first",
        materials: null
      },
      {
        description: "Use active learning techniques (summarizing, teaching others)",
        materials: null
      },
      {
        description: "Test your knowledge with practice questions",
        materials: "Practice tests, study guide"
      }
    ];
  } else if (taskTitleLower.includes('project') || taskTitleLower.includes('presentation')) {
    return [
      {
        description: "Research and gather information on your topic",
        materials: "Computer, internet, library resources"
      },
      {
        description: "Create an outline or plan for your project",
        materials: "Paper, pen, or digital tools"
      },
      {
        description: "Start working on the main content",
        materials: null
      },
      {
        description: "Add visual elements and formatting",
        materials: "Design tools, images, charts"
      },
      {
        description: "Practice and rehearse your presentation",
        materials: "Timer, mirror, or recording device"
      }
    ];
  } else {
    // Generic steps for other tasks
    return [
      {
        description: "Gather all necessary materials and resources",
        materials: "Paper, pen, calculator, textbook"
      },
      {
        description: "Read through the task requirements carefully",
        materials: "Task description, instructions"
      },
      {
        description: "Break down the task into smaller, manageable parts",
        materials: null
      },
      {
        description: "Start with the easiest or most familiar section first",
        materials: null
      },
      {
        description: "Review and double-check your work before finishing",
        materials: null
      }
    ];
  }
};

export async function handle(request: Request) {
  try {
    const body = await request.json();
    const validatedInput = schema.parse(body);
    
    console.log('Generate steps request for task:', validatedInput.title);
    
    try {
      // Try ChatGPT first
      const steps = await callChatGPT(validatedInput.title);
      console.log('Successfully generated steps with ChatGPT');
      return Response.json(steps);
    } catch (chatgptError) {
      console.warn('ChatGPT failed, using contextual mock data:', chatgptError);
      // Fall back to contextual mock data
      const contextualSteps = generateContextualSteps(validatedInput.title);
      return Response.json(contextualSteps);
    }
  } catch (error) {
    console.error('Generate steps error:', error);
    return Response.json(
      { error: 'Failed to generate steps' },
      { status: 400 }
    );
  }
}