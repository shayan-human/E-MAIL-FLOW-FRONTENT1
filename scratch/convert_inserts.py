import re
import sys

def convert_to_multi_insert(input_file, output_file, table_name, batch_size=100):
    with open(input_file, 'r') as f:
        content = f.read()
    
    # Match INSERT INTO public.leads (...) VALUES (...)
    pattern = rf"INSERT INTO {table_name} \((.*?)\) VALUES \((.*?)\) ON CONFLICT DO NOTHING;"
    matches = re.findall(pattern, content)
    
    if not matches:
        print(f"No matches for {table_name}")
        return

    cols = matches[0][0]
    vals = [m[1] for m in matches]
    
    with open(output_file, 'w') as f:
        for i in range(0, len(vals), batch_size):
            batch = vals[i:i+batch_size]
            f.write(f"INSERT INTO {table_name} ({cols}) VALUES\n")
            f.write(",\n".join([f"({v})" for v in batch]))
            f.write("\nON CONFLICT DO NOTHING;\n\n")

if __name__ == "__main__":
    # Example usage for leads
    convert_to_multi_insert('scratch/insert_chunk_aa', 'scratch/multi_leads.sql', 'public.leads', 50)
