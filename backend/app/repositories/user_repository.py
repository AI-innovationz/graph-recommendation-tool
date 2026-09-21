from app.models.user import User
from app.models.location import Location
from neo4j import GraphDatabase
# from app.knowledge.graph import knowledgeGraph
from app.utils.parseRequest import parse_request
# from app.nlp.embedding_service import EmbeddingService
# from app.knowledge.vector_index import VectorIndex

URI = "neo4j+ssc://913033d2.databases.neo4j.io"
AUTH = (
    "913033d2",
    "OIa0nQr0fPo9MXkKbZ_PMLA6Fey6JLhVfCG2fqw3AeU"
)

class UserRepository:
    def __init__(self):
        self.users: list[User] = []
        self.driver = GraphDatabase.driver(
            URI,
            auth=AUTH
        )

        self.add_query = """
                        MERGE (u:User {user_id: $user_id})
                        SET
                            u.name = $name,
                            u.phone = $phone,
                            u.latitude = $latitude,
                            u.longitude = $longitude
                        """
        self.update_query = """
                    MERGE (u:User {user_id: $user_id})
                    SET
                        u.name = $name,
                        u.helper = true

                    WITH u

                    UNWIND $preferences AS pref

                    MERGE (s:Entity {name: pref})

                    MERGE (u)-[:HELPS_WITH]->(s)
                """
        self.update_original_query = """
                    MERGE (u:User {user_id: $user_id})
                    SET
                        u.name = $name,
                        u.helper = true

                    WITH u

                    UNWIND $preferences AS pref

                    MERGE (s:Entity {name: pref})

                    MERGE (u)-[:HELPS_ORIGINAL_WITH]->(s)
                """
        self.get_user_query = """
                    MATCH (u:User {
                    user_id: $user_id
                    })
                    RETURN u
                    """
        
    def add(self, user:User,raw_user):
        self.users.append(user)
        self.driver.execute_query(
            self.add_query,
            user_id=user.id,
            name = user.name,
            phone = user.phone,
            latitude  = raw_user.latitude,
            longitude = raw_user.longitude,
            database_="913033d2" 

        )

        


    def get_all(self) -> list[User]:
        return self.users

    def get_by_id(self, user_id: str) -> User | None:
        result = self.driver.execute_query(self.get_user_query,user_id=user_id,database_="913033d2")
        if not result.records:
            return None
        node = result.records[0]["u"]
        return User(
        id=node["user_id"],
        name=node["name"],
        phone=node["phone"],
        location=Location(node["latitude"],node["longitude"])
    )

    def update_user(self,user:User,vi):
        # em = EmbeddingService()
        print(user,"user---------")
        print(user.preferences,"pref----")
        preferences = parse_request([],user.preferences)
        final_pref = preferences[:]
        for p in preferences:
            # print(graph.graph,"graph----")
            tmp = list(vi.search(p,k=5))
            for score,src in tmp:
                final_pref.append(src)
            # # for source,neighbours in graph.graph.items():
            # #     print(source)
            # #     if em.similarity(str(p),source)>=0.9:
            #         final_pref.append(source)
        
        print(final_pref,"final_pref- array--")     
        try:
            records, summary,keys=self.driver.execute_query(self.update_query,user_id=user.id,name=user.name,preferences = final_pref,database_="913033d2")
            record_original,summary_original,keys_original = self.driver.execute_query(self.update_original_query,user_id=user.id,name=user.name,preferences = preferences,database_="913033d2")
            return [preferences,final_pref]
        except Exception as e:
            return e