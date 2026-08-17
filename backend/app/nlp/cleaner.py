import re


class Cleaner:
    """
    Cleans raw Wikipedia documents.
    """

    def __init__(self):
        pass

    def clean(self, documents):
        """
        Cleans every document.

        Parameters
        ----------
        documents : dict
            {
                "Insulin": "...text...",
                "Dog": "...text..."
            }

        Returns
        -------
        dict
            Cleaned documents
        """

        cleaned_documents = {}

        for title, text in documents.items():
            cleaned_documents[title] = self.clean_document(text)

        return cleaned_documents

    def clean_document(self, text):
        """
        Cleans a single document.
        """

        # Remove citations like [1], [25]
        text = re.sub(r"\[[0-9]+\]", "", text)

        # Remove multiple newlines
        text = re.sub(r"\n+", "\n", text)

        # Remove tabs
        text = text.replace("\t", " ")

        # Remove multiple spaces
        text = re.sub(r" +", " ", text)

        # Remove leading/trailing spaces
        text = text.strip()

        return text