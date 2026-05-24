import json

with open("eslint_report.json", "r", encoding="utf-16") as f:
    data = json.load(f)

for file in data:
    errors = [m for m in file["messages"] if m["severity"] == 2]
    if errors:
        print(file["filePath"])
        for err in errors:
            print(f"  Line {err['line']}: {err['message']} ({err['ruleId']})")
