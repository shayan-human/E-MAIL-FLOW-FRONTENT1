const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf-8');
const n8nBase = envContent.match(/N8N_BASE_URL=(.*)/)?.[1]?.trim();
const n8nKey = envContent.match(/N8N_API_KEY=(.*)/)?.[1]?.trim();

fetch(`${n8nBase}/api/v1/workflows/TIqj5mMH7xZz75MY/activate`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': n8nKey
    }
})
    .then(res => res.json())
    .then(data => console.log("Activation response:", data ? "Success" : data))
    .catch(console.error);
