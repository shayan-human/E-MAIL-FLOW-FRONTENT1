import re
import os

def convert_copy_to_insert(backup_file, output_dir, batch_size=50):
    os.makedirs(output_dir, exist_ok=True)
    
    current_table = None
    current_cols = None
    current_vals = []
    
    copy_pattern = re.compile(r"COPY\s+([\w\.]+)\s+\((.*?)\)\s+FROM stdin;", re.IGNORECASE)
    
    with open(backup_file, 'r') as f:
        for line in f:
            if line.startswith('\\.'): # End of COPY block
                if current_table and current_vals:
                    save_inserts(output_dir, current_table, current_cols, current_vals, batch_size)
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
                vals = line.strip().split('\t')
                formatted_vals = []
                for v in vals:
                    if v == '\\N':
                        formatted_vals.append('NULL')
                    else:
                        escaped = v.replace("'", "''")
                        formatted_vals.append(f"'{escaped}'")
                current_vals.append(", ".join(formatted_vals))

def save_inserts(output_dir, table_name, cols, vals, batch_size):
    file_friendly_name = table_name.replace('.', '_')
    
    conflict_target = "id"
    if table_name == "public.campaign_accounts":
        conflict_target = "campaign_id, sender_account_id"
    elif table_name == "public.campaign_stats":
        conflict_target = "campaign_id"
    elif table_name == "public.user_settings":
        conflict_target = "user_id"
    
    with open(f"{output_dir}/{file_friendly_name}.sql", 'w') as f:
        for i in range(0, len(vals), batch_size):
            batch = vals[i:i+batch_size]
            f.write(f"-- BATCH START --\n")
            f.write(f"INSERT INTO {table_name} ({cols}) VALUES\n")
            f.write(",\n".join([f"({v})" for v in batch]))
            f.write(f"\nON CONFLICT ({conflict_target}) DO NOTHING;\n")
            f.write(f"-- BATCH END --\n\n")

if __name__ == "__main__":
    convert_copy_to_insert('emailflowbackupppp20260423_170122.sql', 'scratch/stable_restored_inserts', 50)
