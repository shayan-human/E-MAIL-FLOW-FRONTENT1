const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const n8nBase = envContent.match(/N8N_BASE_URL=(.*)/)?.[1]?.trim();
const n8nKey = envContent.match(/N8N_API_KEY=(.*)/)?.[1]?.trim();

if (!n8nBase || !n8nKey) {
    console.error("Missing N8N credentials");
    process.exit(1);
}

const workflowJSON = {
    name: "Central Campaign Dispatcher",
    settings: {},
    nodes: [
        {
            parameters: {
                httpMethod: "POST",
                path: "campaign-dispatch",
                responseMode: "onReceived",
                options: {}
            },
            name: "Webhook",
            type: "n8n-nodes-base.webhook",
            typeVersion: 1,
            position: [0, 0]
        },
        {
            parameters: {
                jsCode: `
const data = $input.first().json.body || $input.first().json;
if (!data || !data.leads) {
  return [];
}
// Return leads as individual items, passing along the campaign metadata
return data.leads.map(lead => ({ 
    json: { 
        lead: lead, 
        campaign: data 
    } 
}));
                `
            },
            name: "Data Transformation",
            type: "n8n-nodes-base.code",
            typeVersion: 1,
            position: [200, 0]
        },
        {
            parameters: {
                batchSize: 1,
                options: {}
            },
            name: "Loop",
            type: "n8n-nodes-base.splitInBatches",
            typeVersion: 1,
            position: [400, 0]
        },
        {
            parameters: {
                amount: "={{ Math.floor(Math.random() * ($json.campaign.scheduling.maxDelay - $json.campaign.scheduling.minDelay + 1)) + $json.campaign.scheduling.minDelay }}",
                unit: "minutes"
            },
            name: "Wait",
            type: "n8n-nodes-base.wait",
            typeVersion: 1,
            position: [600, 0]
        },
        {
            parameters: {
                method: "POST",
                url: "https://oauth2.googleapis.com/token",
                sendBody: true,
                bodyParameters: {
                    parameters: [
                        { name: "client_id", value: "={{$env.get('GOOGLE_CLIENT_ID')}}" },
                        { name: "client_secret", value: "={{$env.get('GOOGLE_CLIENT_SECRET')}}" },
                        { name: "refresh_token", value: "={{$json.lead.assignedRefreshToken}}" },
                        { name: "grant_type", value: "refresh_token" }
                    ]
                },
                options: {}
            },
            id: "fetch-access-token",
            name: "Fetch Access Token",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.1,
            position: [700, 0],
            onError: "stopWorkflow"
        },
        {
            parameters: {
                method: "POST",
                url: "https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send",
                sendHeaders: true,
                headerParameters: {
                    parameters: [
                        { name: "Authorization", value: "=Bearer {{$json.access_token}}" },
                        { name: "Content-Type", value: "message/rfc822" }
                    ]
                },
                sendBody: true,
                specifyBody: "string",
                body: "={{ \nconst subject = $node['Loop'].json.campaign.subject;\nconst body = $node['Loop'].json.campaign.body;\nconst to = $node['Loop'].json.lead.email;\nconst from = $node['Loop'].json.lead.assignedSenderEmail;\n\n// Very basic raw message building. \n// To, From, Subject, followed by empty line, followed by body.\nconst raw = \`To: \${to}\\r\\nFrom: \${from}\\r\\nSubject: \${subject}\\r\\nContent-Type: text/html; charset=utf-8\\r\\n\\r\\n\${body}\`;\n\n// Base64Url encode it exactly as Google requires\nreturn Buffer.from(raw).toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');\n}}",
                options: {}
            },
            id: "send-strict-email",
            name: "Send Strict Email",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.1,
            position: [900, 0],
            onError: "stopWorkflow"
        }
    ],
    connections: {
        "Webhook": {
            "main": [[{ "node": "Data Transformation", "type": "main", "index": 0 }]]
        },
        "Data Transformation": {
            "main": [[{ "node": "Loop", "type": "main", "index": 0 }]]
        },
        "Loop": {
            "main": [[{ "node": "Wait", "type": "main", "index": 0 }]]
        },
        "Wait": {
            "main": [[{ "node": "Fetch Access Token", "type": "main", "index": 0 }]]
        },
        "Fetch Access Token": {
            "main": [[{ "node": "Send Strict Email", "type": "main", "index": 0 }]]
        },
        "Send Strict Email": {
            "main": [[{ "node": "Loop", "type": "main", "index": 0 }]]
        }
    }
};

fetch(`${n8nBase}/api/v1/workflows`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': n8nKey
    },
    body: JSON.stringify(workflowJSON)
})
    .then(res => res.json())
    .then(data => {
        if (data.id) {
            console.log("Successfully Deployed to n8n! Workflow ID:", data.id);
            return fetch(`${n8nBase}/api/v1/workflows/${data.id}/activate`, {
                method: 'POST',
                headers: {
                    'X-N8N-API-KEY': n8nKey
                }
            });
        } else {
            throw new Error(JSON.stringify(data));
        }
    })
    .then(res => {
        if (res) console.log("Workflow activated successfully!");
    })
    .catch(console.error);
