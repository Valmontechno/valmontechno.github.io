import os, csv, json, unicodedata

os.chdir(os.path.dirname(os.path.realpath(__file__)))

with open('characters.csv', newline='', encoding='utf-8') as tsvfile:
    reader = csv.reader(tsvfile)
    next(reader)
    charactersTable = [row for row in reader]

with open('questions.csv', newline='', encoding='utf-8') as tsvfile:
    reader = csv.reader(tsvfile)
    next(reader)
    questionTable = [row for row in reader]

greekToId = {}
charactersData = {}
questionsData = []

# for row in charactersTable:
#     print(row[0], len(row))
#     print(row)
#     print()

for greekName, romanName, occurrence, functions, attributes, description, image, imageCredit in charactersTable:
    id = ''.join([char for char in unicodedata.normalize('NFKD', greekName) if not unicodedata.combining(char)])
    id = id.lower().replace(' ', '-')

    greekToId[greekName] = id

    charactersData[id] = {
        'greekName': greekName,
        'romanName': romanName,
        'description': description,
        'image': image,
        'imageCredit': imageCredit
    }

for row in questionTable:
    question = {}
    question['question'] = row[0]
    question['answers'] = []

    for i in range(1, len(row), 2):
        label = row[i]
        if label == '': break

        answer = {}
        answer['label'] = label

        characters = row[i+1]
        if characters == '':
            answer['characters'] = []
        else:
            characters = characters.split(', ')
            answer['characters'] = [(greekToId[character], 1) for character in characters]

        question['answers'].append(answer)

    questionsData.append(question)

with open('../characters.json', 'w', encoding='utf-8') as jsonfile:
    json.dump(charactersData, jsonfile, ensure_ascii=False, indent=None)
    
with open('../questions.json', 'w', encoding='utf-8') as jsonfile:
    json.dump(questionsData, jsonfile, ensure_ascii=False, indent=None)

print(f'{len(charactersData)} characters and {len(questionsData)} questions')
print('Done')