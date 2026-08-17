import spacy
from app.nlp.relation_extractor import RelationExtractor
from app.nlp.sentence_splitter import SentenceSplitter
nlp = spacy.load('en_core_web_sm')
def parse_request(req:list,request:str):
    doc = nlp(request)
    for noun in doc.noun_chunks:
        req.append(noun)


    print(req,"final req---")   

    return req

    
