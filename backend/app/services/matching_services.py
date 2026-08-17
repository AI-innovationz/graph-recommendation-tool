from app.models.request import Request
from app.models.user import User
from app.models.enum import UserRole,RequestType
from app.api.user_routes import UserRepository
from app.utils.distance import DistanceCalculator
# from apprecommendation_services import Recommendations
from app.services.recommendation_services import Recommendations
from app.models.recommendation import Recommendation
from neo4j import GraphDatabase
URI = "neo4j+ssc://913033d2.databases.neo4j.io"
AUTH = (
    "913033d2",
    "OIa0nQr0fPo9MXkKbZ_PMLA6Fey6JLhVfCG2fqw3AeU"
)


class MatchingService:
    def __init__(self,user_repository:UserRepository):
        self.user_repository = user_repository
        self.driver = GraphDatabase.driver(
                    URI,
                    auth=AUTH
                )
        self.fetch_helper_query = """
                                MATCH (u:User)-[:HELPS_WITH]->(e:Entity)
                                WHERE e.name IN $preferences
                                RETURN u, collect(e.name) AS matched_preferences
                                  """
     

    def find_best_helper(self, request: Request) -> list[Recommendation]:

        try:
            users = self.user_repository.get_all()
        except Exception as e:
            print(e, "error----")
            return []

        recommendations = Recommendations(self.user_repository)

        related_concepts = recommendations.get_related_concepts(request)
        print(related_concepts,"RELATED CONCEPTS--------")
        records,summary,keys = self.driver.execute_query(self.fetch_helper_query,preferences = related_concepts,database_="913033d2")
        print(records,"result of helper query-----------")
        return records