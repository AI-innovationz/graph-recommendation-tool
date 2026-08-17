import re
import spacy

from nltk.corpus import wordnet
class TripletValidator:

    def __init__(self, nlp):

        self.nlp = nlp

        self.STOP_WORDS = {
            "it", "its", "they", "them", "their",
            "this", "that", "these", "those",
            "there", "here",
            "something", "anything", "everything",
            "someone", "anyone"
        }

        self.GENERIC_WORDS = {
            "example", "examples",
            "thing", "things",
            "kind", "kinds",
            "type", "types",
            "part", "parts",
            "area", "areas",
            "group", "groups",
            "series",
            "issue", "issues",
            "problem", "problems",
            "factor", "factors",
            "effect", "effects",
            "condition", "conditions",
            "quality", "qualities",
            "level", "levels",
            "number", "numbers",
            "case", "cases",
            "process", "processes",
            "method", "methods",
            "publication", "publications",
            "study", "studies",
            "paper", "papers",
            "recommendation", "recommendations",
            "minutes", "minute",
            "portion", "portions",
            "limit", "limits",
            "moment",
            "scale",
            "risk",
            "chance"
        }

        self.WEAK_RELATIONS = {
            "is", "was", "are", "were",
            "be", "been", "being",
            "has", "have", "had"
        }

        self.INVALID_POS = {
            "VERB",
            "AUX",
            "ADP",
            "PRON",
            "CCONJ",
            "SCONJ",
            "PART",
        }

        self.INVALID_DEP = {
            "prep",
            "aux",
            "auxpass",
            "mark",
            "cc",
        }

    #################################################

    def normalize(self, text):

        text = text.lower().strip()
        text = re.sub(r"\s+", " ", text)

        return text

    #################################################




    def is_verb_in_lexicon(self, word):
        # 1. Clean the string to lowercase for lexicon consistency
        word_lower = word.lower()

        structural_nouns = {
        "nurse", "nurses","patient","patients"
    }
        if word_lower in structural_nouns:
            return False
        
        verb_synsets = wordnet.synsets(word_lower, pos=wordnet.VERB)
        noun_synsets = wordnet.synsets(word_lower, pos=wordnet.NOUN)
        
        # If it has zero verb forms, it's definitively not a verb
        if not verb_synsets:
            return False
            
        # If it is only a verb and has zero noun forms, it's definitively a verb
        if verb_synsets and not noun_synsets:
            return True
            
        # If it has BOTH (like doctor, diagnose, record, process), count their usage frequency
        # .count() returns how often that specific definition appears in standard text corpora
        verb_count = sum(lemma.count() for synset in verb_synsets for lemma in synset.lemmas() if lemma.name().lower() == word_lower)
        noun_count = sum(lemma.count() for synset in noun_synsets for lemma in synset.lemmas() if lemma.name().lower() == word_lower)
        
        # Fallback to definition count if corpus usage counts are both zero
        if verb_count == 0 and noun_count == 0:
            return len(verb_synsets) >= len(noun_synsets)
            
        # Return True if it is primarily used as a verb over a noun
        return verb_count > noun_count

    
    def sanitize_entity(self, entity):
        """
        Separates misclassified verbs and converts plural nouns to singular forms.
        """
        cleaned_noun_tokens = []
        separated_verbs = []
        entity = self.nlp(entity)
        for token in entity:
            word = token.text
           
            
            # 1. Identify and separate the misclassified verbs
            if self.is_verb_in_lexicon(word) and not cleaned_noun_tokens:
                print(word,"word----")
                separated_verbs.append(word)
            else:
                # 2. If it's a plural noun (NNS) or plural proper noun (NNPS), use its lemma (singular form)
                if token.tag_ in ["NNS", "NNPS"]:
                    print('plural---',token.lemma_)
                    cleaned_noun_tokens.append(token.lemma_)
                else:
                    cleaned_noun_tokens.append(word)
            print(cleaned_noun_tokens,"tokens--")
                
        return " ".join(cleaned_noun_tokens)

    #################################################

    def entity_score(self, entity):

        entity = self.normalize(entity)

        score = 0

        if not entity:
            return -100

        if entity in self.STOP_WORDS:
            return -100

        if entity in self.GENERIC_WORDS:
            score -= 5

        if len(entity.split()) > 1:
            score += 2

        if any(ch.isdigit() for ch in entity):
            score += 2

        if "&" in entity:
            score -= 2

        if len(entity) == 1:
            score -= 5

        if re.fullmatch(r"\W+", entity):
            score -= 5

        return score

    #################################################

    def relation_score(self, relation):

        relation = self.normalize(relation)

        score = 0

        if relation in self.WEAK_RELATIONS:
            score -= 2
        else:
            score += 2

        return score

    #################################################

    def context_score(self, context):

        context = context.lower()

        score = 0

        if "for example" in context:
            score -= 1

        if "such as" in context:
            score -= 1

        if "including" in context:
            score -= 1

        return score

    #################################################

    def score(self, triple):

        src = self.normalize(triple["source"])
        rel = self.normalize(triple["relationship"])
        tgt = self.normalize(triple["target"])
        ctx = triple.get("context", "")

        score = 0

        score += self.entity_score(src)
        score += self.entity_score(tgt)
        score += self.relation_score(rel)
        score += self.context_score(ctx)

        if src == tgt:
            score -= 10

        if rel == src or rel == tgt:
            score -= 10

        if tgt == "example":
            score -= 10

        if src == "example":
            score -= 10

        if src in self.GENERIC_WORDS:
            score -= 5

        if tgt in self.GENERIC_WORDS:
            score -= 5

        if len(src) < 2 or len(tgt) < 2:
            score -= 10

        return score

    #################################################

    def keep(self, triple):

        triple["source"] = self.sanitize_entity(
            triple["source"]
        )

        triple["target"] = self.sanitize_entity(
            triple["target"]
        )

        if not triple["source"] or not triple["target"]:
            return False

        return self.score(triple) >= 0