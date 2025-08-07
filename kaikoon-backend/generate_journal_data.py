# import json
# import random


# tasks = [
#     "complete math homework",
#     "study for biology test",
#     "write English essay",
#     "attend coding club meeting",
#     "prepare presentation slides",
# ]


# deadlines = [
#     "by tomorrow",
#     "next Monday",
#     "before Friday",
#     "in two days",
#     "this weekend",
# ]


# obstacles = [
#     "feeling tired",
#     "lack of motivation",
#     "noise at home",
#     "distraction from phone",
#     "not enough time",
# ]


# def create_sample():
#     task = random.choice(tasks)
#     deadline = random.choice(deadlines)
#     obstacle = random.choice(obstacles)


#     text = f"I need to {task} {deadline} but I am {obstacle}."


#     # Find character offsets for entities
#     task_start = text.index(task)
#     task_end = task_start + len(task)


#     deadline_start = text.index(deadline)
#     deadline_end = deadline_start + len(deadline)


#     obstacle_start = text.index(obstacle)
#     obstacle_end = obstacle_start + len(obstacle)


#     entities = [
#         [task_start, task_end, "TASK"],
#         [deadline_start, deadline_end, "DEADLINE"],
#         [obstacle_start, obstacle_end, "OBSTACLE"],
#     ]


#     return {"text": text, "entities": entities}


# def generate_dataset(num_samples=500, output_file="training_data.jsonl"):
#     with open(output_file, "w") as f:
#         for _ in range(num_samples):
#             sample = create_sample()
#             f.write(json.dumps(sample) + "\n")


# if __name__ == "__main__":
#     generate_dataset()
#     print("Synthetic dataset generated in training_data.jsonl")


import json
import random


tasks = [
    "finish my science project",
    "complete my math homework",
    "study for the biology exam",
    "prepare the slides for my presentation",
    "write my English essay on Shakespeare",
]


deadlines = [
    "by tomorrow evening",
    "before Friday afternoon",
    "next Monday morning",
    "in the next two days",
    "this coming weekend",
]


obstacles = [
    "I keep getting distracted by my phone notifications",
    "the noise from my siblings makes it hard to concentrate",
    "I'm feeling mentally drained today",
    "I can't seem to find the motivation to start",
    "there are family events that are eating into my study time",
]


def daily_task_stress(task, deadline, obstacle):
    return (
        f"I woke up feeling overwhelmed today. I have to {task} {deadline}, "
        f"but {obstacle}. Every time I try to focus, something pulls me away. "
        "It's so frustrating because I really want to get this done, but my brain just won’t cooperate."
    )


def emotional_venting(task, deadline, obstacle):
    return (
        f"I'm so frustrated! I’ve been trying to {task} {deadline}, "
        f"yet {obstacle}. It's like no matter how hard I try, things keep getting in my way. "
        "I'm exhausted, and I just wish people understood how hard it is to stay on track."
    )


def productivity_planning(task, deadline, obstacle):
    return (
        f"Planning is my only hope right now. I must {task} {deadline}. "
        f"The challenge is that {obstacle}. I’ll try breaking it down into smaller chunks and maybe set a timer "
        "to stay focused. If I can manage to avoid distractions for even 20 minutes, it’ll be progress."
    )


def reflective_weekly_recap(task, deadline, obstacle):
    return (
        f"This week has been a rollercoaster. Among all the chaos, I still need to {task} {deadline}. "
        f"One major hurdle has been that {obstacle}. Looking back, I realize that when I planned my week better, "
        "I managed tasks more smoothly. So, next week, I’ll make a checklist and keep it visible."
    )


TEMPLATE_FUNCTIONS = [
    daily_task_stress,
    emotional_venting,
    productivity_planning,
    reflective_weekly_recap
]


def create_rich_journal_entry():
    task = random.choice(tasks)
    deadline = random.choice(deadlines)
    obstacle = random.choice(obstacles)


    template_func = random.choice(TEMPLATE_FUNCTIONS)
    entry = template_func(task, deadline, obstacle)


    task_start = entry.index(task)
    task_end = task_start + len(task)


    deadline_start = entry.index(deadline)
    deadline_end = deadline_start + len(deadline)


    obstacle_start = entry.index(obstacle)
    obstacle_end = obstacle_start + len(obstacle)


    entities = [
        [task_start, task_end, "TASK"],
        [deadline_start, deadline_end, "DEADLINE"],
        [obstacle_start, obstacle_end, "OBSTACLE"],
    ]


    return {"text": entry, "entities": entities}


def generate_rich_journal_dataset(num_samples=100, output_file="training_data.jsonl"):
    with open(output_file, "w") as f:
        for _ in range(num_samples):
            sample = create_rich_journal_entry()
            f.write(json.dumps(sample) + "\n")


if __name__ == "__main__":
    generate_rich_journal_dataset()
    print("Generated diverse journal entries in training_data.jsonl")
