import json

from .relation_validator import TripletValidator
import spacy

nlp = spacy.load('en_core_web_sm')

validator = TripletValidator(nlp)

INPUT_FILE = "knowledge_base_triples.json"
OUTPUT_FILE = "relations_clean.json"
REMOVED_FILE = "removed_relations.json"


with open(INPUT_FILE,"r",encoding="utf-8") as f:
    triples=json.load(f)

# triples = [
#         {
#         "source": "Doctors",
#         "relationship": "identify",
#         "target": "diagnose diseases",
#         "confidence": 0.95,
#         "context": "Doctors examine patients, identify symptoms, diagnose diseases, prescribe medicines, and recommend medical procedures."
#     }
# ]


clean=[]
removed=[]

seen=set()

for triple in triples:

    if not validator.keep(triple):
        removed.append(triple)
        continue

    key=(
        triple["source"].strip().lower(),
        triple["relationship"].strip().lower(),
        triple["target"].strip().lower()
    )

    if key in seen:
        continue

    seen.add(key)

    clean.append(triple)


with open(OUTPUT_FILE,"w",encoding="utf-8") as f:
    json.dump(clean,f,indent=4,ensure_ascii=False)

with open(REMOVED_FILE,"w",encoding="utf-8") as f:
    json.dump(removed,f,indent=4,ensure_ascii=False)


print(f"Original : {len(triples)}")
print(f"Removed  : {len(removed)}")
print(f"Kept     : {len(clean)}")