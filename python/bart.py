from transformers import pipeline

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

text = """The Hugging Face Transformers library provides pre-trained models for NLP tasks such as text classification, 
          named entity recognition, and text summarization. It allows users to fine-tune models or use them directly 
          for inference with minimal code."""

summary = summarizer(text, max_length=50, min_length=10, do_sample=False)

print("Summary:", summary[0]['summary_text'])
