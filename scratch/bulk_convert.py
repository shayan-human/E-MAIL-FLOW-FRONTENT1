import re
import os

def process_backup(backup_file, output_dir, batch_size=100):
    os.makedirs(output_dir, exist_ok=True)
    
    table_data = {}
    
    # regex for INSERT INTO table (cols) VALUES (vals)
    # Handling potential indentation and missing semicolon/conflict
    pattern = re.compile(r"INSERT INTO\s+([\w\.]+)\s+\((.*?)\)\s+VALUES\s+\((.*?)\)", re.IGNORECASE)
    
    with open(backup_file, 'r') as f:
        for line in f:
            match = pattern.search(line)
            if match:
                table_name = match.group(1)
                # Ensure table name has a schema
                if '.' not in table_name:
                    if table_name in ['leads', 'campaigns', 'email_logs', 'sender_accounts', 'campaign_accounts', 'campaign_stats', 'blocked_leads']:
                        table_name = f"public.{table_name}"
                    elif table_name in ['configs']:
                        table_name = f"ai.{table_name}"
                
                cols = match.group(2)
                vals = match.group(3)
                
                if table_name not in table_data:
                    table_data[table_name] = {'cols': cols, 'vals': []}
                
                table_data[table_name]['vals'].append(vals)

    for table_name, data in table_data.items():
        cols = data['cols']
        vals = data['vals']
        
        file_friendly_name = table_name.replace('.', '_')
        with open(f"{output_dir}/{file_friendly_name}.sql", 'w') as f:
            for i in range(0, len(vals), batch_size):
                batch = vals[i:i+batch_size]
                f.write(f"INSERT INTO {table_name} ({cols}) VALUES\n")
                f.write(",\n".join([f"({v})" for v in batch]))
                f.write("\nON CONFLICT DO NOTHING;\n\n")
        print(f"Generated {len(vals)} rows for {table_name}")

if __name__ == "__main__":
    process_backup('emailflowbackupppp20260423_170122.sql', 'scratch/multi_inserts', 50)
