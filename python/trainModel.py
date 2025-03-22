import spacy
from spacy.training import Example
import random

nlp = spacy.load("en_core_web_sm")
ner = nlp.get_pipe("ner")
ner.add_label("CRIME_LOC")

TRAIN_DATA = [
    ("A robbery took place at MG Road, Bengaluru.", {"entities": [(24, 43, "CRIME_LOC")]}),
    ("The murder happened near Indiranagar.", {"entities": [(25, 36, "CRIME_LOC")]}),
    ("A theft was reported at Brigade Road.", {"entities": [(24, 36, "CRIME_LOC")]}),
    ("The burglary occurred at Whitefield, Bangalore.", {"entities": [(25, 46, "CRIME_LOC")]}),
    ("A gold heist took place in Koramangala.", {"entities": [(27, 38, "CRIME_LOC")]}),
    ("A daring gold heist took place at Shree Lakshmi Jewelers on MG Road, Bengaluru, late Monday night. According to police officials, a group of masked burglars broke into the store around 2:30 AM and made away with gold and diamond jewelry worth over ₹5 crore. CCTV footage revealed that the suspects arrived in a black SUV, which was later seen speeding towards Electronic City via Bannerghatta Road. The police suspect that the gang might have connections to Chennai and could be planning an escape towards Hosur. 'We have intensified security checks at all major highways, including NH-44, leading towards Tamil Nadu. The suspects seem to be professionals, and we are coordinating with law enforcement agencies in Mysuru and Coimbatore to track them down,' said ACP Ramesh Kumar of the Bengaluru Crime Branch. This incident marks the third major jewelry store robbery in the city within the last six months. Police urge citizens and shop owners in areas like Indiranagar, Jayanagar, and Whitefield to remain vigilant.", {"entities": [(34, 78, "CRIME_LOC")]})
]

other_pipes = [pipe for pipe in nlp.pipe_names if pipe != "ner"]

with nlp.disable_pipes(*other_pipes):
    optimizer = nlp.begin_training()

    for epoch in range(80):
        random.shuffle(TRAIN_DATA)
        losses = {}

        for text, annotations in TRAIN_DATA:
            doc = nlp.make_doc(text)
            example = Example.from_dict(doc, annotations)
            nlp.update([example], losses=losses, drop=0.5)
            print(f"Epoch {epoch+1}/80, Losses: {losses}")

nlp.to_disk("crime_model")
print("Training completed...")
