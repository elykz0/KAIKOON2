# Task Management Assistant for Neurodivergent Teens

SUMMARY
When you open Kaikoon, you first see a quick logo screen, then a two-step setup that asks for your grade and which classes you take. After that, you land on the main to-do list it shows your current Kaiblooms points, any tasks you've added, and a big plus button. Tap the plus, type a task, and hit Break into steps the app uses ChatGPT to suggest smaller sub-tasks and the materials you'll need. You set how many minutes you think the whole task will take, save it, and the task appears on your list. When you tap that task, you see its step-by-step checklist and a timer—you can start, pause, or reset it while you work. Once every sub-task is checked off and you stop the timer, a Finish button pops up. Press Finish, pick an emoji to show how you feel, write a short reflection, and the app labels your text as positive, neutral, or negative. You instantly earn Kaiblooms points, get a Great job message, and return to the main list ready to add or tackle the next task.
MAIN PROBLEM
Neurodivergent teens often forget materials, miss task-start cues, and abandon homework midway because executive-function skills are hard for them to self-manage.
MAIN SOLUTION
Kaikoon is a mobile micro-coach that turns everyday school prep and study sessions into short, reward-based missions.
APP FLOW
Splash logo First-time setup Main to-do screen Add a task Work on it Reflect Back to main screen
SCREENS AND WHAT HAPPENS ON THEM
Splash Shows the Kaikoon logo
First-time setup
Choose your school grade
Pick the classes you take
Done button takes you to the main screen
Main screen
Title at top + a counter showing how many Kaiblooms you have
List of tasks the user has added
Big + button in the corner to add a new task
Add Task
Text box What is the task
Button Break into steps
Field How many minutes do you think this will take
Save button
Task detail screen
Shows the smaller steps with check-boxes
Shows the timer you set
When all steps are checked and the timer is stopped, a button Finish task appears
Reflection pop-up
Pick one of five heart-face emojis to say how you feel
Short text box How did it go
Button Analyze my text
The app adds 15 Kaiblooms
Settings
Change grade or classes
Turn bigger text or haptic buzz on/off
Clear all data
WHAT THE APP SAVES
A task title, estimated minutes, list of steps, and whether it is done
Each step its own done/not-done box and any materials
Reflection emoji number, the text, and its Positive / Neutral / Negative label
Total Kaiblooms points

Built with Floot.

# How to use

1. Import FlootSetup.css to set up the css variables and basic styles.
2. Import the components into your react codebase.

# ChatGPT Integration Setup

The "Break into steps" feature uses ChatGPT to generate dynamic, contextual steps based on the task title. To enable this feature:

## 1. Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the API key

## 2. Configure the Environment

1. Open the `.env` file in the project root
2. Replace `your_openai_api_key_here` with your actual OpenAI API key:

   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

   **Note**: The API key is automatically exposed to the client-side code as `VITE_OPENAI_API_KEY`.

## 3. Restart the Development Server

After updating the `.env` file, restart the development server:

```bash
npm run dev
```

## How it Works

- When you click "Break into steps", the app sends the task title to ChatGPT
- ChatGPT analyzes the task and generates 3-6 specific, actionable steps
- Each step includes a description and any materials needed
- If ChatGPT is unavailable, the app falls back to contextual mock data based on task keywords
- The system now handles all types of tasks: academic, daily chores, personal care, hobbies, and more

## Fallback Behavior

If the OpenAI API is not configured or unavailable, the app will:

1. Try to use the backend API (if available)
2. Fall back to contextual mock data based on task keywords
3. Provide generic steps if no specific context is detected

### Supported Task Types

The system now recognizes and provides contextual steps for:

**Academic Tasks:**

- Homework, assignments, studying, projects, presentations

**Daily Chores:**

- Cleaning, organizing, laundry, tidying

**Personal Care:**

- Showering, bathing, grooming, self-care

**Pet Care:**

- Feeding pets, walking dogs, pet care

**Cooking & Food:**

- Cooking meals, meal preparation, food tasks

**Exercise & Fitness:**

- Workouts, exercise routines, gym sessions

**Gardening:**

- Plant care, watering, gardening tasks

**Shopping:**

- Grocery shopping, errands, buying items

**Reading:**

- Reading books, studying materials

**And more!** The system adapts to any task type with appropriate steps and materials.

## Examples

**Academic Task:**

- Task: "Finish math homework"
- Steps: Read instructions, gather materials, solve problems, check work

**Daily Chore:**

- Task: "Feed the dog"
- Steps: Check food type, measure food, prepare bowl, add water, clean up

**Personal Care:**

- Task: "Take a shower"
- Steps: Gather toiletries, adjust water, wash body, wash hair, dry off

**Cooking:**

- Task: "Cook dinner"
- Steps: Check recipe, gather ingredients, prepare area, follow recipe, clean up

**Exercise:**

- Task: "Work out"
- Steps: Choose clothes, warm up, do routine, cool down, hydrate

The system now adapts to any task type with appropriate, practical steps!

# Journal & Task Analysis

The dashboard now includes a journal feature that can analyze your entries for tasks, deadlines, and obstacles using ChatGPT:

## How It Works

1. **Write a Journal Entry**: Click the book icon in the dashboard header
2. **AI Analysis**: The system analyzes your text for:
   - **Tasks**: Homework, projects, assignments, etc.
   - **Deadlines**: Tomorrow, Friday, next week, etc.
   - **Obstacles**: Distractions, noise, motivation issues, etc.
3. **Create Tasks**: Select which tasks to create and they'll be added to your task list with generated subtasks

## Example Journal Entry

```
"I need to finish my math homework by tomorrow evening, but I keep getting distracted by my phone notifications. I also have a science project due next week that I haven't started yet."
```

**Analysis Results**:

- **Tasks Found**: Complete homework, Finish project
- **Deadlines**: Tomorrow, Next week
- **Obstacles**: Phone distractions
- **Suggested Schedule**: Time blocks for each task
- **Generated Subtasks**: AI-generated step-by-step breakdown

## Backend Integration

The journal analysis can integrate with the trained NER model in `kaikoon-backend/` for more sophisticated analysis:

1. **Install Python Dependencies**:

   ```bash
   cd kaikoon-backend
   pip install -r requirements.txt
   ```

2. **Run the Backend Server**:

   ```bash
   uvicorn infer_tasks:app --reload --port 8000
   ```

3. **The frontend will automatically use the backend model** when available, falling back to keyword-based analysis when not.

## Features

- **Smart Task Detection**: Identifies tasks, deadlines, and obstacles from natural language
- **ChatGPT Integration**: Generates contextual subtasks for each identified task
- **Obstacle Strategies**: Suggests strategies to overcome identified obstacles
- **Schedule Suggestions**: Creates time blocks for task completion
- **Automatic Task Creation**: Converts journal analysis into actionable tasks
