from .embedding_service import EmbeddingService
emb = EmbeddingService()

print(
    emb.similarity(
        "heart attack",
        "chest pain"
    )
)

print(
    emb.similarity(
        "heart attack",
        "banana"
    )
)