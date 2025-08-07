# Example realistic journal entry
text = """
Today has been super stressful. I need to finish my science project by tomorrow evening,
but I keep getting distracted by my phone notifications. It’s frustrating because I know
how important this project is. Maybe I should try turning off my phone for a few hours.
"""


text2 = """
This week has been really exhausting. I still need to complete my math homework before Friday afternoon,
but I can't seem to find the motivation to start. Every time I sit down to work, the noise from my siblings
makes it hard to concentrate. I'm trying to plan my tasks better, but it's overwhelming. Hopefully
I can get it done in time.
"""

# Full Pipeline: Journal Entry --> Optimized Schedule with Time Slots, Subtasks, Preferences and Summary Feedback
from fastapi import FastAPI
from pydantic import BaseModel
import spacy
from datetime import datetime, timedelta
import re
import dateparser
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Trained NER Model
nlp = spacy.load("./kaikoon-backend/output/model-best")

# Load/Save Student Profile
def load_student_profile():
    try:
        with open('student_profile.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "preferred_work_block": 45,
            "break_time": 10,
            "focus_hours": ["09:00", "18:00"],
            "obstacle_keywords": ["family", "noise", "phone"]
        }

def save_student_profile(profile):
    with open('student_profile.json', 'w') as f:
        json.dump(profile, f, indent=4)

# Utility Functions
def parse_deadline(deadline_text):
    dt = dateparser.parse(deadline_text, settings={'PREFER_DATES_FROM': 'future'})
    return dt

def allocate_time_slots(tasks, deadlines, focus_hours, student_profile, start_time=None):
    tasks_with_deadlines = []
    for task in tasks:
        deadline = deadlines.get(task, None)
        parsed_deadline = parse_deadline(deadline) if deadline else None
        tasks_with_deadlines.append((task, parsed_deadline))

    tasks_sorted = sorted(tasks_with_deadlines, key=lambda x: x[1] or datetime.max)
    start_time = start_time or datetime.now().replace(hour=int(focus_hours[0].split(":")[0]), minute=0, second=0)
    end_time = datetime.now().replace(hour=int(focus_hours[1].split(":")[0]), minute=0, second=0)

    schedule = []
    current_time = start_time

    for task, deadline_dt in tasks_sorted:
        if current_time >= end_time:
            break
        work_block = timedelta(minutes=student_profile['preferred_work_block'])
        break_block = timedelta(minutes=student_profile['break_time'])
        schedule.append({
            "task": task,
            "start": current_time.strftime('%I:%M %p'),
            "end": (current_time + work_block).strftime('%I:%M %p'),
            "deadline": deadline_dt.strftime('%Y-%m-%d %H:%M') if deadline_dt else "None"
        })
        current_time += work_block + break_block
    return schedule

def break_down_task(task_text):
    keywords = task_text.lower().split()
    subtasks = []
    if "essay" in keywords:
        subtasks = ["Outline main points", "Write introduction", "Complete body and conclusion"]
    elif "project" in keywords:
        subtasks = ["Research topic", "Draft content", "Finalize presentation"]
    elif "homework" in keywords:
        subtasks = ["Review instructions", "Solve problems", "Double-check answers"]
    else:
        subtasks = ["Break task into smaller parts", "Focus on one part", "Review progress"]
    return subtasks

OBSTACLE_STRATEGIES = [
    {"pattern": r"phone|notifications|social media", "strategy": "Enable 'Focus Mode'."},
    {"pattern": r"noise|siblings|environment", "strategy": "Use noise-cancelling headphones."},
    {"pattern": r"motivation|focus|overwhelmed", "strategy": "Use Pomodoro sprints."},
]

def match_obstacle_strategies(obstacle_text):
    strategies = []
    for pattern in OBSTACLE_STRATEGIES:
        if re.search(pattern["pattern"], obstacle_text, re.IGNORECASE):
            strategies.append(pattern["strategy"])
    return strategies if strategies else ["Break into small tasks and time-box."]

def update_student_profile(feedback, student_profile):
    if 'preferred_session_length' in feedback:
        student_profile['preferred_work_block'] = feedback['preferred_session_length']
    if 'task_times' in feedback:
        avg_time = sum(feedback['task_times'].values()) / len(feedback['task_times'])
        student_profile['preferred_work_block'] = int(min(max(avg_time, 15), 120))
    if 'obstacles' in feedback:
        for obs in feedback['obstacles']:
            words = obs.lower().split()
            for w in words:
                if w not in student_profile['obstacle_keywords']:
                    student_profile['obstacle_keywords'].append(w)
    save_student_profile(student_profile)
    return student_profile

# ---------------- API SCHEMAS ----------------
class JournalEntry(BaseModel):
    text: str

class FeedbackInput(BaseModel):
    task_times: dict
    obstacles: list
    preferred_session_length: int | None = None

# ---------------- API ENDPOINTS ----------------
@app.post("/analyze-journal/")
def analyze_journal(entry: JournalEntry):
    doc = nlp(entry.text)
    tasks, deadlines, obstacles = [], {}, []
    current_task = None

    for ent in doc.ents:
        if ent.label_ == "TASK":
            current_task = ent.text
            tasks.append(current_task)
        elif ent.label_ == "DEADLINE" and current_task:
            deadlines[current_task] = ent.text
        elif ent.label_ == "OBSTACLE":
            obstacles.append(ent.text)

    student_profile = load_student_profile()
    scheduled_tasks = allocate_time_slots(tasks, deadlines, student_profile["focus_hours"], student_profile)

    feedback_summary = "You mentioned that you need to "
    if tasks:
        feedback_summary += ", and ".join(tasks)
    if deadlines:
        deadline_descriptions = "; ".join([f"'{task}' by {deadline}" for task, deadline in deadlines.items()])
        feedback_summary += f", specifically {deadline_descriptions}"
    if obstacles:
        obstacle_descriptions = ", ".join(obstacles)
        feedback_summary += f". However, you're facing obstacles such as {obstacle_descriptions}"
    feedback_summary += ". Let's work on a plan to address these."

    schedule_output = []
    for entry in scheduled_tasks:
        schedule_output.append({
            "task": entry['task'],
            "start": entry['start'],
            "end": entry['end'],
            "deadline": entry['deadline'],
            "subtasks": break_down_task(entry['task'])
        })

    obstacle_strategies = []
    for obs in obstacles:
        strategies = match_obstacle_strategies(obs)
        obstacle_strategies.append({"obstacle": obs, "strategies": strategies})

    return {
        "tasks": tasks,
        "deadlines": deadlines,
        "obstacles": obstacles,
        "schedule": schedule_output,
        "obstacle_strategies": obstacle_strategies,
        "feedback_summary": feedback_summary
    }

@app.post("/submit-feedback/")
def submit_feedback(feedback: FeedbackInput):
    student_profile = load_student_profile()
    updated_profile = update_student_profile(feedback.model_dump(), student_profile)
    return {"status": "Profile Updated", "profile": updated_profile}

# Run with: uvicorn filename:app --reload
