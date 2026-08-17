from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


class EmbeddingService:

    def __init__(self):

        self.model = SentenceTransformer(
            "BAAI/bge-large-en-v1.5"
        )

    ####################################################

    def encode(self, text: str):

        embedding = self.model.encode(
            text,
            normalize_embeddings=True,
            convert_to_numpy=True
        )

        return embedding.tolist()

    ####################################################

    def similarity(self, text1: str, text2: str):

        emb1 = np.array(self.encode(text1)).reshape(1, -1)
        emb2 = np.array(self.encode(text2)).reshape(1, -1)

        score = cosine_similarity(
            emb1,
            emb2
        )[0][0]

        return float(score)