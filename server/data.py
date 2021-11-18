import requests
import json
import time
from bs4 import BeautifulSoup


people = []

for a in range(1, 50):
    r = requests.get('https://www.behindthename.com/random/random.php?number=1&sets=1&gender=both&surname=&showextra=yes&norare=yes&nodiminutives=yes&usage_spa=1')
    soup = BeautifulSoup(r.text, 'lxml')
    name = soup.find_all("a", class_="plain")[0].get_text()
    tds = soup.find_all("td")
    for i in range(1, len(tds)):
        if(tds[i].get_text()=="Age:"):
            age = tds[i+1].get_text()
        if(tds[i].get_text()=="Blood type:"):
            blood = tds[i+1].get_text()
        if(tds[i].get_text()=="Height:"):
            height = tds[i+1].get_text()
    people.append({"name": name, "age": age, "blood": blood, "height": height})
    time.sleep(3)

with open("./output.json", "w+") as f:
    f.write(json.dumps(people))