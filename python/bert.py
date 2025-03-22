from transformers import pipeline

ner = pipeline("ner", model="dbmdz/bert-large-cased-finetuned-conll03-english")

text = """A daring gold heist took place at Shree Lakshmi Jewelers on MG Road, Bengaluru, late Monday night. 
According to police officials, a group of masked burglars broke into the store around 2:30 AM and made away 
with gold and diamond jewelry worth over ₹5 crore. CCTV footage revealed that the suspects arrived in a black SUV, 
which was later seen speeding towards Electronic City via Bannerghatta Road. The police suspect that the gang 
might have connections to Chennai and could be planning an escape towards Hosur. 
'We have intensified security checks at all major highways, including NH-44, leading towards Tamil Nadu. The suspects seem to be professionals, 
and we are coordinating with law enforcement agencies in Mysuru and Coimbatore to track them down,' said ACP Ramesh Kumar
 of the Bengaluru Crime Branch. This incident marks the third major jewelry store robbery in the city within the last six months. 
 Police urge citizens and shop owners in areas like Indiranagar, Jayanagar, and Whitefield to remain vigilant."""

entities = ner(text)

location_entities = [e['word'] for e in entities if "LOC" in e['entity']]
time_entities = [e['word'] for e in entities if "DATE" in e['entity'] or "TIME" in e['entity']]

print("Locations:", set(location_entities))
print("Time:", set(time_entities))


from transformers import pipeline
import re

ner = pipeline("ner", model="dbmdz/bert-large-cased-finetuned-conll03-english", aggregation_strategy="simple")

def extract_address(text):
    event_keywords = ["heist", "robbery", "burglary", "accident", "fire", "meeting", "conference", "theft"]
    pattern = r"(?:(?:\b" + r"\b|\b".join(event_keywords) + r"\b).+?(\.|$))"
    
    match = re.search(pattern, text, re.IGNORECASE)
    if not match:
        return "No event-related sentence found!"
    
    event_sentence = match.group(0)
    print("Event Sentence:", event_sentence)

    entities = ner(event_sentence)
    
    address = [e['word'] for e in entities if e['entity_group'] == "LOC"]

    return f"Address: {' '.join(address) if address else 'Not found'}"

text = """A daring gold heist took place at Shree Lakshmi Jewelers on MG Road, Bengaluru, late Monday night. According to police officials, a group of masked burglars broke into the store around 2:30 AM and made away with gold and diamond jewelry worth over ₹5 crore. CCTV footage revealed that the suspects arrived in a black SUV, which was later seen speeding towards Electronic City via Bannerghatta Road. The police suspect that the gang might have connections to Chennai and could be planning an escape towards Hosur. 'We have intensified security checks at all major highways, including NH-44, leading towards Tamil Nadu. The suspects seem to be professionals, and we are coordinating with law enforcement agencies in Mysuru and Coimbatore to track them down,' said ACP Ramesh Kumar of the Bengaluru Crime Branch. This incident marks the third major jewelry store robbery in the city within the last six months. Police urge citizens and shop owners in areas like Indiranagar, Jayanagar, and Whitefield to remain vigilant."""

print(extract_address(text))

