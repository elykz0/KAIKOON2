import spacy
from spacy.tokens import DocBin
import json

# Load base model
nlp = spacy.load("en_core_web_sm")
# nlp = spacy.blank("en")  # <--- Use blank model if we're training custom NER


# Define new NER labels
ner = nlp.get_pipe("ner")
ner.add_label("TASK")
ner.add_label("DEADLINE")
ner.add_label("OBSTACLE")

# Load annotated data
doc_bin = DocBin()
with open("training_data.jsonl", "r") as f:
    for line in f:
        data = json.loads(line)
        doc = nlp.make_doc(data["text"])
        ents = []
        for start, end, label in data["entities"]:
            span = doc.char_span(start, end, label=label)
            if span:
                ents.append(span)
        doc.ents = ents
        doc_bin.add(doc)

doc_bin.to_disk("train.spacy")

# Training Configuration
config = """
[paths]
train = "./train.spacy"
dev = "./train.spacy"
vectors = null

[system]
gpu_allocator = "pytorch"

[nlp]
lang = "en"
pipeline = ["tok2vec","ner"]
batch_size = 128

[components.ner]
factory = "ner"

[components.tok2vec]
factory = "tok2vec"

[training]
optimizer.learn_rate = 0.001
max_steps = 500
"""

# Save config file
with open("config.cfg", "w") as f:
    f.write(config)

# Train Model
# !python3 -m spacy train config.cfg --output ./output --paths.train ./train.spacy --paths.dev ./train.spacy
# python3 -m spacy train config.cfg --output ./output
#uvicorn infer_tasks:app --reload                             
