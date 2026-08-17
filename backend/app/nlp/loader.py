from pathlib import Path


class Loader:
    """
    Loads all .txt documents from data/raw
    """

    def __init__(self, data_dir="../backend/app/data/raw"):
        self.data_dir = Path(data_dir)

    def load(self):
        """
        Returns:
            documents (dict):
            {
                "Insulin": "...full article...",
                "Diabetes": "...full article..."
            }
        """

        documents = {}

        # Check if directory exists
        if not self.data_dir.exists():
            raise FileNotFoundError(
                f"Directory not found: {self.data_dir.resolve()}"
            )

        # Read every txt file
        for file in self.data_dir.rglob("*.txt"):

            try:
                with open(file, "r", encoding="utf-8") as f:
                    documents[file.stem] = f.read()

            except Exception as e:
                print(f"Could not read {file.name}: {e}")

        return documents

    def statistics(self, documents):
        """
        Print dataset statistics
        """

        total_docs = len(documents)

        total_chars = sum(len(text) for text in documents.values())

        total_words = sum(len(text.split()) for text in documents.values())

        avg_chars = (
            total_chars / total_docs
            if total_docs
            else 0
        )

        avg_words = (
            total_words / total_docs
            if total_docs
            else 0
        )

        print("=" * 50)
        print("DATASET STATISTICS")
        print("=" * 50)
        print(f"Documents        : {total_docs}")
        print(f"Characters       : {total_chars:,}")
        print(f"Words            : {total_words:,}")
        print(f"Avg Characters   : {avg_chars:.0f}")
        print(f"Avg Words        : {avg_words:.0f}")
        print("=" * 50)