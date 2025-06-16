import os
import json

# Config
BASE_IMAGE_DIR = "images"
OUTPUT_JSON = "data/people.json"

people = []

for department in os.listdir(BASE_IMAGE_DIR):
    department_path = os.path.join(BASE_IMAGE_DIR, department)
    
    if not os.path.isdir(department_path):
        continue

    for filename in os.listdir(department_path):
        if filename.lower().endswith((".jpg", ".jpeg", ".png")):
            # Split filename and reformat name
            last_first = os.path.splitext(filename)[0]
            parts = last_first.split("_")
            
            # Handle both "Last_First" and "First_Last" cases
            if len(parts) >= 2:
                # Assume format is Last_First
                first_name = parts[-1]  # Last element
                last_name = "_".join(parts[:-1])  # All except last
                full_name = f"{first_name} {last_name}"
            else:
                full_name = last_first.replace("_", " ")
            
            people.append({
                "name": full_name,  # e.g. "Daniel Amato"
                "department": department,
                "image": f"{BASE_IMAGE_DIR}/{department}/{filename}"
            })

with open(OUTPUT_JSON, "w") as f:
    json.dump(people, f, indent=2)

print(f"Generated {OUTPUT_JSON} with {len(people)} entries")