from neo4j import GraphDatabase
from app.nlp.embedding_service import EmbeddingService

URI = "neo4j+ssc://913033d2.databases.neo4j.io"
AUTH = (
    "913033d2",
    "OIa0nQr0fPo9MXkKbZ_PMLA6Fey6JLhVfCG2fqw3AeU"
)


class GraphBuilder:

    def __init__(self,vi):

        self.embedding = vi.em

        self.driver = GraphDatabase.driver(
            URI,
            auth=AUTH
        )

        self.query = """
        UNWIND $rows AS row

        MERGE (s:Entity {name: row.source})
        ON CREATE SET
            s.embedding = row.source_embedding

        MERGE (t:Entity {name: row.target})
        ON CREATE SET
            t.embedding = row.target_embedding

        MERGE (s)-[r:RELATED_TO {
            relation: row.relation
        }]->(t)

        ON CREATE SET
            r.count = 1,
            r.confidence = row.confidence,
            r.context = row.context,
            r.embedding = row.edge_embedding,
            r.weight = row.similarity

        ON MATCH SET
            r.count = r.count + 1,
            r.weight = row.similarity*0.8 + log10(r.count+1)*0.2,
            r.confidence = CASE
                WHEN row.confidence > r.confidence
                THEN row.confidence
                ELSE r.confidence
            END
        """

    def build_graph(self, relation_list):

        batch = []

        for relation in relation_list:

            batch.append({

                "source": relation["source"],

                "target": relation["target"],

                "relation": relation["relationship"],

                "confidence": relation.get(
                    "confidence",
                    1.0
                ),

                "context": relation.get(
                    "context",
                    ""
                ),

                # Node embeddings
                "source_embedding": self.embedding.encode(
                    relation["source"]
                ),

                "target_embedding": self.embedding.encode(
                    relation["target"]
                ),

                # Context / edge embedding
                "edge_embedding": self.embedding.encode(
                    relation.get(
                        "context",
                        f'{relation["source"]} '
                        f'{relation["relationship"]} '
                        f'{relation["target"]}'
                    )
                ),

                "similarity": self.embedding.similarity(relation["source"],relation["target"])
            })

            if len(batch) == 500:

                self.driver.execute_query(
                    self.query,
                    rows=batch,
                    database_="913033d2"
                )

                batch = []

        if batch:

            self.driver.execute_query(
                self.query,
                rows=batch,
                database_="913033d2"
            )

    def close(self):

        self.driver.close()