from neo4j import GraphDatabase
# from app.nlp.embedding_service import EmbeddingService
from app.knowledge.graph import knowledgeGraph

class DataFetch:
    def __init__(self):
        self.URI = "neo4j+ssc://913033d2.databases.neo4j.io"
        self.AUTH = ("913033d2", "OIa0nQr0fPo9MXkKbZ_PMLA6Fey6JLhVfCG2fqw3AeU")
        self.driver = GraphDatabase.driver(self.URI, auth=self.AUTH)
        self.kg = knowledgeGraph()

    def fetch_data(self):
        records, summary, keys = self.driver.execute_query(

                """
                MATCH (s:Entity)-[r:RELATED_TO]->(t:Entity)
                RETURN
                    s.name AS source,
                    t.name AS target,
                    r.embedding AS embedding,
                    s.embedding AS node_embedding,
                    r.weight AS weight,
                    r.relation AS relation
                """,
                database_="913033d2"
                )       
        self.driver.close()
        print(summary,"summar----")
        for record in records:
            # print(record["source"],record["target"],record["relation"],record["weight"])
            self.kg.add_edge(record["source"],record["target"],record["relation"],record["weight"],record["node_embedding"])
            self.kg.add_edge(record["target"],record["source"],record["relation"],record["weight"],record["node_embedding"])
        return self.kg
        