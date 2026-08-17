from loader import Loader
from cleaner import Cleaner
from sentence_splitter import SentenceSplitter

loader = Loader()
cleaner = Cleaner()
splitter = SentenceSplitter()

documents = loader.load()
documents = cleaner.clean(documents)

sentences = splitter.split(documents)

title = list(sentences.keys())[0]

print(title)

print()

print("Total sentences:", len(sentences[title]))

print()

for s in sentences[title][:10]:
    print("-", s)