from loader import Loader
from cleaner import Cleaner

loader = Loader()
documents = loader.load()

cleaner = Cleaner()

cleaned = cleaner.clean(documents)

title = list(cleaned.keys())[0]

print(title)
print("-" * 50)
print(cleaned[title][:1000])