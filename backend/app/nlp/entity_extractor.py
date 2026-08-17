class EntityExtractor:

    def __init__(self):
        pass

    def extract(self, sentence_dict):

        results = {}

        for title, sentences in sentence_dict.items():

            results[title] = []

            for sentence in sentences:

                doc = sentence["doc"]

                entities = []

                for ent in doc.ents:

                    entities.append(
                        {
                            "text": ent.text,
                            "label": ent.label_,
                            "start": ent.start_char,
                            "end": ent.end_char,
                        }
                    )

                results[title].append(
                    {
                        "sentence": sentence["text"],
                        "entities": entities,
                    }
                )

        return results