
    
from app.knowledge.data_fetch import DataFetch
from app.knowledge.bfs import bfs
from app.api.user_routes import UserRepository
from app.models.request import Request
# from app.utils.ratio import getDepthDecay


class Recommendations:

    def __init__(self, user_repo: UserRepository):
        self.user_repository = user_repo
        data_fetch = DataFetch()
        self.graph = data_fetch.fetch_data()
        # self.depth_decay_factor = getDepthDecay(self.graph)

    def get_related_concepts(self, request: Request):

        merged = []
        final_req = []
        for req_type in request.request_type:
            final_req.append(req_type)
        print(final_req,"FINAL REQUEST-------")
        bfs_result = bfs(self.graph, final_req)
        print(bfs_result,"bfs_result logged---")
        bfs_result.sort(key = lambda x:x[0],reverse=True)
        for res in bfs_result:
            score, dest, path, depth = res
            merged.append(dest)

               
        return merged