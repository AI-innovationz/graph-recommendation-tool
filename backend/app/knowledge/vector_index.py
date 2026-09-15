import json
import faiss
import numpy as np
from app.nlp.embedding_service import EmbeddingService
from azure.storage.blob import BlobServiceClient

class VectorIndex:

    def __init__(self, embedding_service=None):
        # ◄ FIXED: Use the passed instance if provided, otherwise default to a new one
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

        self.index = faiss.IndexFlatIP(dimension)
        self.index.add(embeddings)

    def search(self, text, k=30):
        if not self.index:
            raise ValueError("No index loaded in memory. Run build() or load_from_azure() first.")

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
            # FAISS returns -1 if there aren't enough close vectors to satisfy 'k'
            if index == -1:
                continue

            node = self.nodes[index]
            results.append(
                (float(score), node)
            )

        return results

    def save_to_azure(self, connection_string, container_name, index_id):
        """Serializes and uploads both the FAISS index and metadata to Azure Blob Storage."""
        if self.index is None:
            raise ValueError("No index built to save.")

        # 1. Serialize FAISS Index to a byte stream
        chunk = faiss.serialize_index(self.index)
        index_bytes = chunk.tobytes()

        # 2. Serialize Nodes mapping list to a JSON string
        nodes_json = json.dumps(self.nodes)

        # 3. Connect and upload to Azure Blob Storage
        blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        
        # Upload FAISS binary blob
        faiss_blob_client = blob_service_client.get_blob_client(
            container=container_name, 
            blob=f"{index_id}.faiss"
        )
        faiss_blob_client.upload_blob(index_bytes, overwrite=True)

        # Upload Metadata string blob
        meta_blob_client = blob_service_client.get_blob_client(
            container=container_name, 
            blob=f"{index_id}_meta.json"
        )
        meta_blob_client.upload_blob(nodes_json, overwrite=True)
        print(f"Successfully uploaded vector index '{index_id}' to Azure Blob.")

    def load_from_azure(self, connection_string, container_name, index_id):
        """Downloads and reconstructs the FAISS index and node mapping from Azure."""
        blob_service_client = BlobServiceClient.from_connection_string(connection_string)

        # 1. Download FAISS binary blob
        faiss_blob_client = blob_service_client.get_blob_client(
            container=container_name, 
            blob=f"{index_id}.faiss"
        )
        index_bytes = faiss_blob_client.download_blob().readall()
        
        # Reconstruct FAISS Object
        chunk = np.frombuffer(index_bytes, dtype='uint8')
        self.index = faiss.deserialize_index(chunk)

        # 2. Download Metadata JSON blob
        meta_blob_client = blob_service_client.get_blob_client(
            container=container_name, 
            blob=f"{index_id}_meta.json"
        )
        nodes_json = meta_blob_client.download_blob().readall().decode('utf-8')
        self.nodes = json.loads(nodes_json)
        print(f"Successfully loaded vector index '{index_id}' from Azure into memory.")
