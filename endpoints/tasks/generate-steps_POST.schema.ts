import { z } from "zod";
import superjson from 'superjson';

export const schema = z.object({
  title: z.string().min(1, "Task title cannot be empty."),
});

export type InputType = z.infer<typeof schema>;

export type Step = {
  description: string;
  materials: string | null;
};

export type OutputType = Step[];

export const postTasksGenerateSteps = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  
  console.log('Generating steps for task:', validatedInput.title);
  
  // Try ChatGPT first if API key is available
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') {
    try {
      console.log('Attempting ChatGPT integration...');
      
      const prompt = `Given this task: "${validatedInput.title}", please break it down into 3-6 specific, actionable steps that anyone could follow. For each step, provide:
1. A clear description of what to do
2. Any materials or resources needed (if applicable)

Format the response as a JSON array with objects containing "description" and "materials" fields. The materials field should be null if no specific materials are needed.

The task could be anything from academic work to daily chores, personal care, hobbies, or any other activity. Make the steps practical and appropriate for the specific task.

Example formats:

For academic tasks:
[
  {
    "description": "Read through the assignment requirements carefully",
    "materials": "Assignment sheet, rubric"
  },
  {
    "description": "Gather necessary study materials",
    "materials": "Textbook, calculator, paper, pen"
  }
]

For daily chores:
[
  {
    "description": "Gather cleaning supplies",
    "materials": "Cleaning products, rags, vacuum"
  },
  {
    "description": "Start cleaning from top to bottom",
    "materials": "Dust cloth, cleaning spray"
  }
]

For personal care:
[
  {
    "description": "Gather toiletries and clean clothes",
    "materials": "Soap, shampoo, towel, clean clothes"
  },
  {
    "description": "Adjust water temperature",
    "materials": "Shower/bath, water"
  }
]

Make the steps specific to the task and practical for anyone to follow.`;

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
            content: 'You are a helpful assistant that breaks down any task into specific, actionable steps that anyone can follow. You can handle academic tasks, daily chores, personal care, hobbies, work tasks, and any other activities. Always respond with valid JSON.'
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

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        if (content) {
          console.log('ChatGPT response:', content);
          
          // Parse the JSON response
          const steps = JSON.parse(content);
          
          // Validate the response format
          if (Array.isArray(steps)) {
            return steps.map((step: any) => ({
              description: step.description || 'Complete this step',
              materials: step.materials || null,
            }));
          }
        }
      }
    } catch (error) {
      console.warn('ChatGPT integration failed, using contextual mock data:', error);
    }
  } else {
    console.log('OpenAI API key not configured, using contextual mock data');
  }
  
  // Fallback to contextual mock data
  const taskTitle = validatedInput.title.toLowerCase();
  
  // Generate contextual steps based on the task type
  if (taskTitle.includes('homework') || taskTitle.includes('assignment')) {
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
  } else if (taskTitle.includes('study') || taskTitle.includes('review')) {
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
  } else if (taskTitle.includes('project') || taskTitle.includes('presentation')) {
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
  } else if (taskTitle.includes('feed') || taskTitle.includes('pet') || taskTitle.includes('animal')) {
    return [
      {
        description: "Check what type of food your pet needs",
        materials: "Pet food, feeding schedule"
      },
      {
        description: "Measure the correct amount of food",
        materials: "Measuring cup, food bowl"
      },
      {
        description: "Prepare the food (if needed)",
        materials: "Water, mixing bowl (if required)"
      },
      {
        description: "Place the food in your pet's feeding area",
        materials: "Food bowl, clean feeding spot"
      },
      {
        description: "Make sure your pet has fresh water available",
        materials: "Water bowl, clean water"
      }
    ];
  } else if (taskTitle.includes('clean') || taskTitle.includes('tidy') || taskTitle.includes('organize')) {
    return [
      {
        description: "Gather cleaning supplies and tools",
        materials: "Cleaning products, rags, vacuum, trash bags"
      },
      {
        description: "Remove any large items or obstacles",
        materials: null
      },
      {
        description: "Start cleaning from top to bottom",
        materials: "Dust cloth, cleaning spray"
      },
      {
        description: "Organize items and put them in their proper places",
        materials: "Storage containers, labels"
      },
      {
        description: "Do a final check and admire your clean space",
        materials: null
      }
    ];
  } else if (taskTitle.includes('cook') || taskTitle.includes('meal') || taskTitle.includes('food')) {
    return [
      {
        description: "Check what ingredients you need",
        materials: "Recipe, ingredients list"
      },
      {
        description: "Gather all ingredients and cooking tools",
        materials: "Ingredients, pots, pans, utensils"
      },
      {
        description: "Prepare your cooking area",
        materials: "Cutting board, knife, measuring cups"
      },
      {
        description: "Follow the recipe step by step",
        materials: "Recipe instructions, timer"
      },
      {
        description: "Clean up your cooking area when done",
        materials: "Dish soap, sponge, trash"
      }
    ];
  } else if (taskTitle.includes('exercise') || taskTitle.includes('workout') || taskTitle.includes('gym')) {
    return [
      {
        description: "Choose your workout clothes and shoes",
        materials: "Comfortable clothes, athletic shoes"
      },
      {
        description: "Warm up with light stretching",
        materials: "Yoga mat, water bottle"
      },
      {
        description: "Do your main workout routine",
        materials: "Exercise equipment, music"
      },
      {
        description: "Cool down with gentle stretches",
        materials: "Yoga mat, water"
      },
      {
        description: "Hydrate and rest",
        materials: "Water, protein shake (optional)"
      }
    ];
  } else if (taskTitle.includes('shower') || taskTitle.includes('bath') || taskTitle.includes('wash')) {
    return [
      {
        description: "Gather your toiletries and clean clothes",
        materials: "Soap, shampoo, towel, clean clothes"
      },
      {
        description: "Adjust water temperature to your preference",
        materials: "Shower/bath, water"
      },
      {
        description: "Wash your body thoroughly",
        materials: "Soap, washcloth"
      },
      {
        description: "Wash and condition your hair",
        materials: "Shampoo, conditioner"
      },
      {
        description: "Dry off and get dressed",
        materials: "Towel, clean clothes"
      }
    ];
  } else if (taskTitle.includes('laundry') || taskTitle.includes('wash') || taskTitle.includes('clothes')) {
    return [
      {
        description: "Sort clothes by color and fabric type",
        materials: "Dirty clothes, laundry baskets"
      },
      {
        description: "Check pockets and remove any items",
        materials: null
      },
      {
        description: "Add detergent and start the washing machine",
        materials: "Laundry detergent, washing machine"
      },
      {
        description: "Transfer clothes to dryer or hang to dry",
        materials: "Dryer, hangers, clothesline"
      },
      {
        description: "Fold and put away clean clothes",
        materials: "Dresser, hangers, storage"
      }
    ];
  } else if (taskTitle.includes('garden') || taskTitle.includes('plant') || taskTitle.includes('water')) {
    return [
      {
        description: "Check what plants need attention",
        materials: "Garden gloves, watering can"
      },
      {
        description: "Remove any dead leaves or weeds",
        materials: "Garden shears, trash bag"
      },
      {
        description: "Water plants that need it",
        materials: "Watering can, water"
      },
      {
        description: "Add fertilizer if needed",
        materials: "Plant food, gardening tools"
      },
      {
        description: "Clean up your gardening area",
        materials: "Broom, trash bag"
      }
    ];
  } else if (taskTitle.includes('shop') || taskTitle.includes('buy') || taskTitle.includes('store')) {
    return [
      {
        description: "Make a list of what you need to buy",
        materials: "Paper, pen, or shopping app"
      },
      {
        description: "Check your budget and bring payment method",
        materials: "Money, credit card, shopping bags"
      },
      {
        description: "Go to the store and find your items",
        materials: "Shopping cart, list"
      },
      {
        description: "Check prices and compare options",
        materials: null
      },
      {
        description: "Pay for your items and bring them home",
        materials: "Payment method, bags"
      }
    ];
  } else if (taskTitle.includes('read') || taskTitle.includes('book')) {
    return [
      {
        description: "Find a comfortable reading spot",
        materials: "Book, comfortable chair, good lighting"
      },
      {
        description: "Set a reading goal or time limit",
        materials: "Timer, bookmark"
      },
      {
        description: "Start reading and take notes if needed",
        materials: "Notebook, pen, highlighter"
      },
      {
        description: "Take short breaks to rest your eyes",
        materials: "Timer, water"
      },
      {
        description: "Reflect on what you read",
        materials: "Journal, pen"
      }
    ];
  } else {
    // Generic steps for any other task
    return [
      {
        description: "Think about what you need to accomplish",
        materials: "Paper, pen to write down your plan"
      },
      {
        description: "Gather any tools or materials you'll need",
        materials: "Required tools, supplies, equipment"
      },
      {
        description: "Break the task into smaller, manageable steps",
        materials: null
      },
      {
        description: "Start with the easiest or most important part first",
        materials: null
      },
      {
        description: "Check your progress and make sure everything is complete",
        materials: null
      }
    ];
  }
};