from collections import defaultdict 
import heapq

class knowledgeGraph:
    def __init__(self):
        self.graph = defaultdict(list)

    def add_edge(self,source:str,destination:str,relation:str,weight:float):
        heapq.heappush(self.graph[source.lower()],(-weight,destination.lower(),relation))
        # print(self.graph)

    def get_neighbours(self,node:str):
        # print(node,"node in get_neighbours")
        # print("Searching:", repr(node))
        # print("Graph dict:", self.graph)
        # print("Keys:", list(self.graph.keys()))
        return self.graph.get(node,[])