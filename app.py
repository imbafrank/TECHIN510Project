import nltk
from nltk.tokenize import word_tokenize

text = "Computers don't speak English. So, we've to learn C, C++, Java, Python and the like! Yay!"
words = word_tokenize(text)
pos_tagged_text = nltk.pos_tag(words)
print(pos_tagged_text)