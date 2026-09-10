import json

from app.nlp.loader import Loader
from app.nlp.cleaner import Cleaner
from app.nlp.sentence_splitter import SentenceSplitter
from app.nlp.relation_extractor import RelationExtractor
from app.nlp.relation_extractor import RelationExtractor
# from graph_builder import GraphBuilder
from app.nlp.graph_builder import GraphBuilder

# # Step 1: Load documents
# loader = Loader()
# documents = loader.load()

# # Step 2: Clean documents
# cleaner = Cleaner()
# documents = cleaner.clean(documents)

# # Step 3: Split into sentences
# splitter = SentenceSplitter()
# sentences = splitter.split(documents)
# # sentences = {'text': 'Some roles are specific to animals, but which have parallels in human society, such as animal grooming and animal massage.','doc': 'Some roles are specific to animals, but which have parallels in human society, such as animal grooming and animal massage.'}
          
        
# print(sentences,"sentences--")
# # Step 4: Extract relations
# extractor = RelationExtractor()
# relations = extractor.extract(sentences)

# # Step 5: Print first 20 relations
# for r in relations[:20]:
#     print(r)


# # import spacy

# # nlp = spacy.load("en_core_web_md")

# # sentence_dict = {
# #     "Test": [
# #         {
# #             "text": "Sundar Pichai works at Google.",
# #             "doc": nlp("Sundar Pichai works at Google.")
# #         },
# #         {
# #             "text": "Elon Musk founded SpaceX.",
# #             "doc": nlp("Elon Musk founded SpaceX.")
# #         },
# #         {
# #             "text": "Satya Nadella leads Microsoft.",
# #             "doc": nlp("Satya Nadella leads Microsoft.")
# #         },
# #         {
# #             "text": "Google acquired YouTube.",
# #             "doc": nlp("Google acquired YouTube.")
# #         },
# #         {
# #             "text": "Microsoft acquired GitHub.",
# #             "doc": nlp("Microsoft acquired GitHub.")
# #         },
# #         {
# #             "text": "Amazon bought Whole Foods.",
# #             "doc": nlp("Amazon bought Whole Foods.")
# #         },
# #         {
# #             "text": "OpenAI developed ChatGPT.",
# #             "doc": nlp("OpenAI developed ChatGPT.")
# #         },
# #         {
# #             "text": "The FDA approves drugs for veterinary medicine.",
# #             "doc": nlp("The FDA approves drugs for veterinary medicine.")
# #         },
# #         {
# #             "text": "Zoo Brasília used stem cells to treat a maned wolf.",
# #             "doc": nlp("Zoo Brasília used stem cells to treat a maned wolf.")
# #         },
# #         {
# #             "text":"Today is Sunday",
# #             "doc":nlp("Today is Sunday")
# #         }
# #     ]
# # }


# # extractor = RelationExtractor()

# # relations = extractor.extract(sentence_dict)

# # for relation in relations:
# #     print(relation)




output_filename = "relations_clean2.json"

# with open(output_filename, "w", encoding="utf-8") as json_file:
#     # indent=4 formats the output neatly for easy viewing
#     json.dump(relations, json_file, indent=4, ensure_ascii=False)

# print(f"Successfully saved {len(relations)} triples to {output_filename}!")

with open(output_filename,"r",encoding="utf-8") as f:
    relations=json.load(f)

graphBuilder = GraphBuilder()

graphBuilder.build_graph(relations)