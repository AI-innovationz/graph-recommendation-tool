import re
import spacy


class SentenceSplitter:

    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")

    def clean_text(self, text: str) -> str:
        """
        Remove Wikipedia-specific markup and noisy sections before NLP.
        """

        cleaned_lines = []

        for line in text.splitlines():

            line = line.strip()

            if not line:
                continue

            # Skip Wikipedia section headings
            if re.match(r"^=+.*=+$", line):
                continue

            # Skip list items
            if line.startswith("*"):
                continue

            # Skip image/file references
            if line.startswith("File:"):
                continue

            if line.startswith("Image:"):
                continue

            cleaned_lines.append(line)

        return "\n".join(cleaned_lines)

    def split(self, documents):

        results = {}

        for title, text in documents.items():

            cleaned_text = self.clean_text(text)

            doc = self.nlp(cleaned_text)

            sentences = []

            for sent in doc.sents:

                sent_text = sent.text.strip()

                if not sent_text:
                    continue

                # Ignore list-like sentences
                if sent_text.startswith("List of"):
                    continue

                # Ignore very short fragments
                if len(sent_text.split()) < 3:
                    continue

                sentences.append(sent)

            results[title] = sentences

        return results