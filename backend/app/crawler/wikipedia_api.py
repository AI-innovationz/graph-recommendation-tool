import wikipedia

wikipedia.set_lang("en")

def get_page(title):
    try:
        page = wikipedia.page(title,auto_suggest=False)

        return{
            "title":page.title,
            "content":page.content,
            "links":page.links,
             "summary":page.summary
        }
    
    except Exception as e:
        print(f"{title}:{e}")
        return None
    

