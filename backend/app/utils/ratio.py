from app.knowledge.bfs import bfs
from app.knowledge.graph_data import graph

def getDepthDecay(graph):
    test_data=['MEDICINE','DOCTOR','HOSPITAL','BLOOD DONATION']
    print("hello")
    for data in test_data:
        bfs_result= bfs(graph,data)
        print(bfs_result,"bfs----result")
    

    

