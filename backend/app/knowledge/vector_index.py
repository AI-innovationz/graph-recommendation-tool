import json
import os

import faiss
import numpy as np

from app.nlp.embedding_service import EmbeddingService

from pathlib import Path
class VectorIndex:

    def __init__(self, embedding_service=None):
        self.em = embedding_service if embedding_service else EmbeddingService()
        self.index = None
        self.nodes = []

    def build(self, graph):
        self.nodes = list(graph.graph.keys())

        embeddings = [
            self.em.encode(node)
            for node in self.nodes
        ]

        embeddings = np.array(
            embeddings,
            dtype="float32"
        )

        # Normalize for cosine similarity
        faiss.normalize_L2(embeddings)

        dimension = embeddings.shape[1]

        # Inner Product on normalized vectors = cosine similarity
        self.index = faiss.IndexFlatIP(dimension)
        self.index.add(embeddings)

    def search(self, text, k=30):
        if self.index is None:
            raise ValueError(
                "No index loaded in memory. "
                "Run build() or load_local() first."
            )

        embedding = self.em.encode(text)

        embedding = np.array(
            [embedding],
            dtype="float32"
        )

        # Normalize query vector for cosine similarity
        faiss.normalize_L2(embedding)

        scores, indices = self.index.search(
            embedding,
            k
        )

        results = []

        for score, index in zip(scores[0], indices[0]):
            # FAISS returns -1 if there aren't enough results
            if index == -1:
                continue

            node = self.nodes[index]

            results.append(
                (float(score), node)
            )

        return results

    def save_local(self, directory="vector_store", index_id="community_helper"):
        """
        Saves the FAISS index and node metadata to the local filesystem.
        """

        if self.index is None:
            raise ValueError("No index built to save.")

        os.makedirs(directory, exist_ok=True)

        # Save FAISS index
        index_path = os.path.join(
            directory,
            f"{index_id}.faiss"
        )

        faiss.write_index(
            self.index,
            index_path
        )

        # Save node mapping
        metadata_path = os.path.join(
            directory,
            f"{index_id}_meta.json"
        )

        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(self.nodes, f)

        print(
            f"Successfully saved vector index '{index_id}' "
            f"to local storage."
        )

    def load_local(
        self,
        directory=str(Path(__file__).resolve().parents[4] / 'Vector_Index' / 'vector_store'),
        index_id="community_helper"
    ):
        """
        Loads the FAISS index and node metadata
        from the local filesystem.
        """

        index_path = os.path.join(
            directory,
            f"{index_id}.faiss"
        )
        print(index_path,"path-----")
        metadata_path = os.path.join(
            directory,
            f"{index_id}_meta.json"
        )

        if not os.path.exists(index_path):
            raise FileNotFoundError(
                f"FAISS index not found: {index_path}"
            )

        if not os.path.exists(metadata_path):
            raise FileNotFoundError(
                f"Metadata file not found: {metadata_path}"
            )

        # Load FAISS index
        self.index = faiss.read_index(index_path)

        # Load node mapping
        with open(metadata_path, "r", encoding="utf-8") as f:
            self.nodes = json.load(f)

        print(
            f"Successfully loaded vector index '{index_id}' "
            f"from local storage."
        )
