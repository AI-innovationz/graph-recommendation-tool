# import spacy
import re
# nlp = spacy.load("en_core_web_sm")

# text = """
# Physical activity can reduce the risk of cardiovascular disease, and people at risk are advised to engage in 150 minutes of moderate or 75 minutes of vigorous intensity aerobic exercise a week.Keeping a healthy weight, drinking alcohol within the recommended limits, and quitting smoking reduce the risk of cardiovascular disease.
# Substituting unsaturated fats such as olive oil and rapeseed oil instead of saturated fats may reduce the risk of myocardial infarction,although there is not universal agreement.Dietary modifications are recommended by some national authorities, with recommendations including increasing the intake of wholegrain starch, reducing sugar intake (particularly of refined sugar), consuming five portions of fruit and vegetables daily, consuming two or more portions of fish per week, and consuming 4–5 portions of unsalted nuts, seeds, or legumes per week.The dietary pattern with the greatest support is the Mediterranean diet.Vitamins and mineral supplements are of no proven benefit,and neither are plant stanols or sterols.
# """

# doc = nlp(text)

class RelationExtractor:

    def __init__(self):

        # Generic entities that rarely form useful KG nodes
        self.BAD_OBJECTS = {
            "year", "years", "time", "times", "period", "span",
            "century", "centuries",
            "example", "examples",
            "study", "studies",
            "paper", "papers",
            "publication", "publications",
            "thing", "things",
            "part", "parts"
        }

        # Temporal modifiers
        self.TIME_DEPS = {
            "npadvmod",
            "tmod",
            "nummod",
            "quantmod"
        }

        # Ignore verbs that merely modify nouns
        self.IGNORE_VERB_DEPS = {
            "acl",
            "relcl",
            "amod",
            "advcl"
        }

        # Prepositions worth following
        self.ALLOWED_PREPS = {
            "by",
            "of",
            "into",
            "onto",
            "against",
            "with"
        }

        # Usually indicate location/time modifiers
        self.LOCATION_PREPS = {
            "in",
            "on",
            "at",
            "during",
            "within",
            "throughout",
            "across",
            "inside",
            "outside",
            "before",
            "after",
            "near",
            "around",
            "over"
        }

        # Example/list markers
        self.LIST_MARKERS = {
            "such",
            "including",
            "like",
            "especially"
        }

    #####################################################
    # Entity Expansion
    #####################################################
    

    LEADING_MODIFIERS = [
        "at least",
        "more than",
        "less than",
        "approximately",
        "about",
        "around",
        "another",
        "almost",
        "roughly",
        "over",
    ]


    def clean_phrase(self, text):

        if not text:
            return None

        text = text.replace("’", "'")
        text = text.replace("“", '"')
        text = text.replace("”", '"')

        text = re.sub(r"\s+", " ", text)

        # remove articles
        text = re.sub(
            r"^(the|a|an)\s+",
            "",
            text,
            flags=re.IGNORECASE,
        )

        # remove quantifiers
        for phrase in self.LEADING_MODIFIERS:
            text = re.sub(
                rf"^{re.escape(phrase)}\s+",
                "",
                text,
                flags=re.IGNORECASE,
            )

        text = text.strip(" ,.;:-()[]{}\"'")

        if not text:
            return None

        return text
    OBJECT_STOP_POS = {
        "CCONJ",
        "SCONJ",
    }

    OBJECT_STOP_DEP = {
        "punct",
    }


    def get_phrase(self, token, doc):

        if token is None:
            return None

        if (
        token.i + 2 < len(doc)
        and doc[token.i + 1].text == "-"
    ):
            return self.clean_phrase(
            token.text
            + "-"
            + doc[token.i + 2].text
        )
        # ------------------------
        # Prefer noun chunk whose root is this token
        # ------------------------
        for chunk in doc.noun_chunks:
            if chunk.root == token:
                return self.clean_phrase(chunk.text)

        # ------------------------
        # Token inside a noun chunk
        # ------------------------
        for chunk in doc.noun_chunks:
            if chunk.start <= token.i < chunk.end:
                return self.clean_phrase(chunk.text)

        # ------------------------
        # Named entity
        # ------------------------
        for ent in doc.ents:
            if ent.start <= token.i < ent.end:
                return self.clean_phrase(ent.text)

        # ------------------------
        # Dependency span fallback
        # ------------------------
        span = doc[token.left_edge.i: token.right_edge.i + 1]

        return self.clean_phrase(span.text)
    def clean_phrase(self, text):

        if not text:
            return None

        text = text.replace("’", "'")
        text = re.sub(r"\s+", " ", text)

        text = text.strip(" ,.;:()[]{}\"'")

        # remove leading determiners
        text = re.sub(
            r"^(the|a|an|this|that|these|those|each|every)\s+",
            "",
            text,
            flags=re.IGNORECASE,
        )

        # remove leading modifiers
        for phrase in self.LEADING_MODIFIERS:
            text = re.sub(
                rf"^{re.escape(phrase)}\s+",
                "",
                text,
                flags=re.IGNORECASE,
            )

        return text.strip()

    #####################################################
    # Semantic object filtering
    #####################################################

    def find_true_semantic_object(self, token):

        if token is None:
            return None

        if token.dep_ in self.TIME_DEPS:
            return None

        if token.like_num:

            parent = token.head.text.lower()

            if parent in {
                "km",
                "year",
                "years",
                "month",
                "months",
                "day",
                "days"
            }:
                return None

        text = self.get_clean_text(token)

        if not text:
            return None

        if text.lower() in self.BAD_OBJECTS:
            return None

        return text

    #####################################################
    # Verb Selection
    #####################################################

    def get_main_verbs(self, sent):

        verbs = []

        ignored = {
            "acl",
            "relcl",
            "amod"
        }

        for token in sent:
        #     print(
        #     token.i,
        #     repr(token.text),
        #     token.dep_,
        #     token.head.text,
        #     token.pos_
        # )

            if token.pos_ != "VERB":
                continue

            if token.dep_ in ignored:
                continue

            if token.dep_ == "advcl" and token.head.dep_ != "ROOT":
                continue

            verbs.append(token)

        return verbs
    # def find_true_semantic_object(self, chunk):

    #     root = chunk.root

    #     if root.dep_ in self.TIME_DEPS:
    #         return None

    #     cleaned = self.get_clean_text(chunk)

    #     if cleaned.lower() in self.BAD_OBJECTS:
    #         return None

    #     return cleaned
    
    #####################################################
# Subject Resolution
#####################################################

    SUBJECT_DEPS = {
    "nsubj",
    "nsubjpass",
    "csubj",
}


    def get_subjects(self, verb, doc):

        # ------------------------
        # Passive voice
        # ------------------------

        has_passive = any(
            child.dep_ == "auxpass"
            for child in verb.children
        )

        if has_passive:

            for child in verb.children:

                if child.dep_ == "agent":

                    for pobj in child.children:

                        if pobj.dep_ != "pobj":
                            continue

                        if pobj.pos_ == "PRON":
                            continue

                        phrase = self.get_phrase(pobj, doc)

                        if phrase:
                            return phrase

        # ------------------------
        # Active voice
        # ------------------------

        for child in verb.children:

            if child.dep_ not in self.SUBJECT_DEPS:
                continue

            if child.pos_ == "PRON":
                continue

            phrase = self.get_phrase(child, doc)

            if phrase:
                return phrase

        return None


    OBJECT_DEPS = {
    "dobj",
    "obj",
    "attr",
    "oprd",
    "pobj",
}


    def get_objects(self, verb, doc):

        candidates = []

        for child in verb.children:

            if child.dep_ in self.OBJECT_DEPS:
                candidates.append(child)
                candidates.extend(child.conjuncts)

            elif child.dep_ == "prep":

                if child.text.lower() in self.LOCATION_PREPS:
                    continue

                for pobj in child.children:

                    if pobj.dep_ == "pobj":
                        candidates.append(pobj)
                        candidates.extend(pobj.conjuncts)

            elif child.dep_ == "xcomp":

                for obj in child.children:

                    if obj.dep_ in self.OBJECT_DEPS:
                        candidates.append(obj)
                        candidates.extend(obj.conjuncts)

        seen = set()
        objects = []

        for token in candidates:

            if token.pos_ == "PRON":
                continue
            if token.text == "-":
                continue

            # Skip the second half of X-rays, follow-up, life-threatening, etc.
            if (
                token.i > 1
                and token.doc[token.i - 1].text == "-"
            ):
                continue
            phrase = self.get_phrase(token, doc)

            if not phrase:
                continue

            key = phrase.lower()

            if key in seen:
                continue

            seen.add(key)

            confidence = 0.95 if token.dep_ == "conj" else 1.0

            objects.append((phrase, confidence))

        return objects

    #####################################################
    # Passive Voice Handling
    #####################################################

    def handle_passive(self, verb, subjects, objects, doc):

        passive_subject = None
        passive_agent = None

        for child in verb.children:

            if child.dep_ == "nsubjpass":
                passive_subject = self.get_phrase(child, doc)

            elif child.dep_ == "agent":

                for pobj in child.children:

                    if pobj.dep_ == "pobj":
                        passive_agent = self.get_phrase(pobj, doc)

        if passive_agent and passive_subject:

            return (
                passive_agent,
                [(passive_subject, 1.0)]
            )

        return subjects, objects

    def extract(self, sentences):

        relations = []

        for title, sents in sentences.items():
            print(title,sents,"sents in extract")
            print(f"Processing: {title}")

            for sent in sents:

                verbs = self.get_main_verbs(sent)

                seen = set()

                for verb in verbs:


                    subjects = self.get_subjects(verb,sent.doc)
                    objects = self.get_objects(verb,sent.doc)
                    if verb.dep_ == 'conj':
                        if not subjects:
                            subjects = self.get_subjects(verb.head,sent.doc)
                    subjects, objects = self.handle_passive(
                        verb,
                        subjects,
                        objects,
                        sent.doc
                    )

                    if not subjects or not objects:
                        continue

                    prep = None

                    for child in verb.children:

                        if child.dep_ != "prep":
                            continue

                        if child.text.lower() not in self.ALLOWED_PREPS:
                            continue
                        # if child.dep_ == "prep":
                        prep = child.text.lower()
                        break

                    RELATION_MAP = {
                        ("divide", "into"): "has_part",
                        ("consist", "of"): "has_part",
                        ("include", None): "includes",
                        ("contain", None): "contains",
                        ("provide", None): "provides",
                        ("serve", None): "serves",
                        ("perform", None): "performs",
                        ("conduct", None): "conducts",
                        ("administer", None): "administers",
                        ("maintain", None): "maintains",
                    }

                    relation = RELATION_MAP.get(
                        (verb.lemma_.lower(), prep),
                        verb.lemma_.lower()
                    )
                    for o, confidence in objects:
                    
                        o = self.clean_phrase(o)
                    
                        if not o:
                            continue
                    
                        # ignore self-relations
                        if subjects.lower() == o.lower():
                                continue
                    
                        # remove duplicate triples
                        key = (
                        subjects.lower(),
                            relation,
                             o.lower()
                            )
                    
                        if key in seen:
                            continue
                    
                        seen.add(key)
                    
                        relations.append({
                                "source": subjects,
                                "relationship": relation,
                                "target": o,
                                "confidence": round(confidence, 2),
                                 "context": sent.text.strip()
                                })
                    

                  

                        
        return relations