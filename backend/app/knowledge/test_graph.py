from app.knowledge.data_fetch import DataFetch
from app.knowledge.bfs import bfs

fetcher = DataFetch()
graph = fetcher.fetch_data()

relevant = ["severe anemia",
    "blood",
    "hemoglobin level",
    "excessive blood loss"
    "blood unit"]
a = 0.1
max_f_score = 0

while a<1:
    res = []
    tp =0
    search_res = bfs(graph,"severe anemia",a)
    # print(res)

    for rec in search_res:
        score,dest,path,depth = rec
        res.append(dest)
        if dest.lower() in relevant:
            tp+=1

   
    # print(res)
    # print(tp,"tp-----")
    fn = len(relevant) - tp
    fp = len(res)-tp
    # print(fn,"fn----")
    # print(fp,"fp----")

    precision = tp/(tp+fp)
    recall = tp/(tp+fn)
    
    f1_score = 2*((precision*recall)/(precision+recall))
    print(a,precision,recall,f1_score)
    a+=0.1
    # f1_score = 0
    # if f1_score<=max_f_score:
    #     break
    # else:
    #     max_f_Score = f1_score
    

# print(
#     bfs(graph, "severe anemia",0.4)
# )
print(a)