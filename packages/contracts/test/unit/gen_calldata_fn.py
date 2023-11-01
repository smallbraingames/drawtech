import json

def read_json_file(file_path):
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
        return data
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error reading the JSON file: {e}")
        return None

file_path = 'rewardFuzzCalldata.json'  # Replace with the actual path to your JSON file
result = read_json_file(file_path)

if result is not None:
    print(f'uint8[][] memory coordInfos = new uint8[][]({len(result)});')
    for i, arr in enumerate(result):
        print(f'coordInfos[{i}] = new uint8[]({len(arr)});') 
        for j, n in enumerate(arr):
            print(f'coordInfos[{i}][{j}] = {n};')
