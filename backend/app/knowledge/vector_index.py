import faiss
import numpy as np
from app.nlp.embedding_service import EmbeddingService

class VectorIndex:

    def __init__(self, embedding_service):
        self.em = EmbeddingService()
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

        self.index = faiss.IndexFlatIP(dimension)

        self.index.add(embeddings)


    def search(self, text, k=30):

        embedding = self.em.encode(text)

        embedding = np.array(
            [embedding],
            dtype="float32"
        )

        faiss.normalize_L2(embedding)

        scores, indices = self.index.search(
            embedding,
            k
        )

        results = []

        for score, index in zip(scores[0], indices[0]):

            node = self.nodes[index]

            results.append(
                (float(score), node)
            )

        return results