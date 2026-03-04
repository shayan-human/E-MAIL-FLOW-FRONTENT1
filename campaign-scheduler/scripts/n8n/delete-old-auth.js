import fetch from 'node-fetch';
import 'dotenv/config';

const n8nBase = process.env.N8N_BASE_URL;
const n8nKey = process.env.N8N_API_KEY;

async function deactivateOld() {
    const res = await fetch(`${n8nBase}/api/v1/workflows`, {
        headers: { 'X-N8N-API-KEY': n8nKey }
    });
    const data = await res.json();
    for (const wf of data.data || []) {
        if (wf.name === "Auth Link Generator" && wf.active) {
            console.log(`Deactivating old workflow: ${wf.id}`);
            await fetch(`${n8nBase}/api/v1/workflows/${wf.id}/deactivate`, {
                method: 'POST',
                headers: { 'X-N8N-API-KEY': n8nKey }
            });
        }
    }
}
deactivateOld();
