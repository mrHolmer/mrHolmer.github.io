import os
import json
from pathlib import Path

# Config
BASE_IMAGE_DIR = "images"
OUTPUT_JSON = "data/people.json"

people = []

for department in os.listdir(BASE_IMAGE_DIR):
    department_path = os.path.join(BASE_IMAGE_DIR, department)
    
    if not os.path.isdir(department_path):
        continue

    for filename in os.listdir(department_path):
        if filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            name_part = Path(filename).stem
            parts = name_part.split("_")
            
            # Name processing with variants
            if len(parts) >= 2:
                first_name = parts[-1].strip()
                last_name = " ".join(parts[:-1]).strip()
                
                # Primary display name
                full_name = f"{first_name} {last_name}"
                
                # Common name variants
                variants = []
            else:
                full_name = name_part.replace("_", " ").strip()
                variants = []
            
            people.append({
                "name": full_name,
                "variants": variants,
                "department": department,
                "image": str(Path(BASE_IMAGE_DIR) / department / filename)
            })

# Create output directory if needed
os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)

# Write JSON with sorted keys for consistency
with open(OUTPUT_JSON, "w") as f:
    json.dump(people, f, indent=2, sort_keys=True)

print(f"Generated {OUTPUT_JSON} with {len(people)} entries")