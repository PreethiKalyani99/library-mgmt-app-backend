import spacy
import sys
import json

nlp = spacy.load("en_core_web_sm")

def extract_location(text):
    doc = nlp(text)
    locations = [ent.text for ent in doc.ents if ent.label_ in ["GPE", "LOC", "ORG"]]
    return list(set(locations))

if __name__ == "__main__":
    input_text = sys.stdin.read().strip().encode("utf-8", "ignore").decode("utf-8")
    locations = extract_location(input_text)
    print(json.dumps({"locations": locations}))
    