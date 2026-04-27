import re
import os

def split_sql_statements(sql_file, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    with open(sql_file, 'r') as f:
        content = f.read()
    
    statements = content.split(';')
    for i, stmt in enumerate(statements):
        stmt = stmt.strip()
        if stmt:
            with open(f"{output_dir}/stmt_{i:04d}.sql", 'w') as f_out:
                f_out.write(stmt + ';')

if __name__ == "__main__":
    split_sql_statements('scratch/bulk_restored_inserts/public_leads.sql', 'scratch/leads_split')
    split_sql_statements('scratch/bulk_restored_inserts/public_email_logs.sql', 'scratch/logs_split')
    split_sql_statements('scratch/bulk_restored_inserts/public_sender_accounts.sql', 'scratch/senders_split')
    split_sql_statements('scratch/bulk_restored_inserts/public_warmup_emails.sql', 'scratch/warmup_split')
