
    
from app.knowledge.data_fetch import DataFetch
from app.knowledge.bfs import bfs
from app.api.user_routes import UserRepository
from app.models.request import Request
# from app.knowledge.vector_index import VectorIndex
# from app.nlp.embedding_service import EmbeddingService
# from app.utils.ratio import getDepthDecay
# from app.knowledge.graph import knowledgeGraph

class Recommendations:

    def __init__(self, user_repo: UserRepository,graph,vi):
        self.user_repository = user_repo
        self.graph = graph
        self.vi = vi
        


        # self.depth_decay_factor = getDepthDecay(self.graph)

    def get_related_concepts(self, request: Request):

        merged = []
        final_req = []
        for req_type in request.request_type:
            final_req.append(req_type)
        print(final_req,"FINAL REQUEST-------")
        bfs_result,final_cache = bfs(self.graph, final_req,self.vi)
        print(bfs_result,"bfs_result logged---")
        # bfs_result = [
        # r for r in bfs_result
        # if r[0] >= 0.65
        # ]

        bfs_result = sorted(
            bfs_result,
            key=lambda x: x[0],
            reverse=True
        )[:5]
        # bfs_result.sort(key = lambda x:x[0],reverse=True)
        for res in bfs_result:
            score, dest, path, depth = res
            merged.append(dest)

               
        return [merged,final_cache]