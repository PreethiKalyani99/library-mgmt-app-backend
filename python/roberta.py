from transformers import pipeline

qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2")

context = """
A 21-year-old youth was found murdered in a public toilet in Fort police station limits here on Monday night. The Fort Police have detained a 16-year-old boy in connection with the murder. Police identified the deceased as Mohamed Ishaq of Tennur area. Police sources said there were cases of pocket picking booked against Ishaq in different police stations in the city limit. Ishaq allegedly snatched a cell phone belonging to the minor boy near Thillai Nagar a week ago. The boy’s mother bought him the cell phone. Angered by this, the boy through his friend called the former. Ishaq and the boy were reportedly consuming liquor inside the toilet when a wordy quarrel broke out between the two. The boy allegedly attacked Ishaq with a sharp weapon on his neck killing him and left the spot. Police sources said based on information and perusal of CCTV footage in the area the police apprehended the minor boy in connection with the crime. The boy was later sent to the Government Observation Home here. The Fort Police have registered a case. Published - January 29, 2020 05:04 am IST murder / Tiruchi
"""

question = "Where did the crime happen?"

result = qa_pipeline(question=question, context=context)

print("Extracted Address:", result["answer"] + ", Trichy")
