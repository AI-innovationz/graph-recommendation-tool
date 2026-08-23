import spacy
from app.nlp.relation_extractor import RelationExtractor
from app.nlp.sentence_splitter import SentenceSplitter
nlp = spacy.load('en_core_web_sm')
def parse_request(req:list,request:str):
    ignore_list = ['I','You','My','Father','Mother','Friend','Sister','Grandfather','Grandmother','Neighbor']
    doc = nlp(request)
    for noun in doc.noun_chunks:
        print(noun,"NOUN-----")
        if str(noun) in ignore_list:
            continue
        req.append(str(noun))

    
    print(req,"final req---")   

    return req

    
