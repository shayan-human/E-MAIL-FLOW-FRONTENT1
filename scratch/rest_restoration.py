import re
import os
import json
import subprocess

def push_to_rest(table_name, cols, rows, url, anon_key):
    # Convert rows to list of dicts
    col_list = [c.strip() for c in cols.split(',')]
    data = []
    for r in rows:
        vals = r.split('\t')
        row_dict = {}
        for i, v in enumerate(vals):
            col = col_list[i]
            if v == '\\N':
                row_dict[col] = None
            else:
                # Basic type conversion for jsonb columns (if we know them)
                if col in ['custom_fields', 'settings', 'metadata']:
                    try:
                        row_dict[col] = json.loads(v)
                    except:
                        row_dict[col] = v
                else:
                    row_dict[col] = v
        data.append(row_dict)
    
    # Save to temp file
    with open('scratch/temp_payload.json', 'w') as f:
        json.dump(data, f)
    
    # Push via curl
    endpoint = f"{url}/rest/v1/{table_name}"
    cmd = [
        "curl", "-X", "POST", endpoint,
        "-H", f"apikey: {anon_key}",
        "-H", f"Authorization: Bearer {anon_key}",
        "-H", "Content-Type: application/json",
        "-H", "Prefer: resolution=merge-duplicates",
        "--data-binary", "@scratch/temp_payload.json"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(f"Pushed {len(data)} rows to {table_name}. Status: {result.returncode}")
    if result.stderr:
        print(f"Error: {result.stderr}")

def convert_and_push(backup_file, url, anon_key):
    current_table = None
    current_cols = None
    current_vals = []
    
    copy_pattern = re.compile(r"COPY\s+public\.([\w\.]+)\s+\((.*?)\)\s+FROM stdin;", re.IGNORECASE)
    
    with open(backup_file, 'r') as f:
        for line in f:
            if line.startswith('\\.'):
                if current_table and current_vals:
                    # Push in batches of 100
                    for i in range(0, len(current_vals), 100):
                        batch = current_vals[i:i+100]
                        push_to_rest(current_table, current_cols, batch, url, anon_key)
                current_table = None
                current_cols = None
                current_vals = []
                continue
            
            copy_match = copy_pattern.match(line)
            if copy_match:
                current_table = copy_match.group(1)
                current_cols = copy_match.group(2)
                current_vals = []
                continue
            
            if current_table:
                current_vals.append(line.strip())

if __name__ == "__main__":
    URL = "https://myagqulgddhnxrxkvvia.supabase.co"
    ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15YWdxdWxnZGRobnhyeGt2dmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDM0NDQsImV4cCI6MjA5Mjc3OTQ0NH0.yz9h3IXnCQFbQ4ltj68dgkH3buFkL_oKcGptfYvZNUs"
    convert_and_push('emailflowbackupppp20260423_170122.sql', URL, ANON_KEY)
