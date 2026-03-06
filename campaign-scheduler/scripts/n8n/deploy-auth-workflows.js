import 'dotenv/config';

// Ensure standard fetch is available
if (!globalThis.fetch) {
    throw new Error("Node 18+ required for native fetch");
}

const n8nBase = process.env.N8N_BASE_URL;
const n8nKey = process.env.N8N_API_KEY;

if (!n8nBase || !n8nKey) {
    console.error("Missing N8N_BASE_URL or N8N_API_KEY in environment.");
    process.exit(1);
}

// ---------------------------------------------------------
// WORKFLOW 1: Auth Link Generator (Sends the Email)
// ---------------------------------------------------------
const authLinkGeneratorWorkflow = {
    name: "Auth Link Generator",
    nodes: [
        {
            parameters: {
                httpMethod: "POST",
                path: "request-auth",
                options: {}
            },
            id: "webhook-request-auth",
            name: "Trigger Auth Request",
            type: "n8n-nodes-base.webhook",
            typeVersion: 1,
            position: [100, 300],
            webhookId: "request-auth"
        },
        {
            parameters: {
                jsCode: `
                const email = $input.item.json.body.email;
                const clientId = $env.get('GOOGLE_CLIENT_ID');
                
                // Construct Google OAuth URL requesting offline access
                const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.send');
                const authUrl = \`https://accounts.google.com/o/oauth2/v2/auth?client_id=\${clientId}&redirect_uri=\${encodeURIComponent($env.get('N8N_BASE_URL') + '/webhook/oauth-callback')}&response_type=code&scope=\${scope}&access_type=offline&prompt=consent&state=\${encodeURIComponent(email)}\`;
                
                return { authUrl, email };
                `
            },
            id: "generate-url",
            name: "Generate Auth URL",
            type: "n8n-nodes-base.code",
            typeVersion: 2,
            position: [300, 300]
        },
        {
            parameters: {
                resource: "message",
                operation: "send",
                subject: "Action Required: Authorize Campaign Scheduler",
                message: "=Please click the following link to authorize sending campaigns from this email address: {{$json.authUrl}}",
                toList: "={{$json.email}}"
            },
            id: "send-auth-email",
            name: "Send Auth Email",
            type: "n8n-nodes-base.gmail",
            typeVersion: 2,
            position: [500, 300],
            credentials: {
                gmailOAuth2: {
                    id: "fkeXR6xz3unegyaP",
                    name: "Gmail account 2"
                }
            }
        }
    ],
    connections: {
        "Trigger Auth Request": {
            main: [
                [
                    { node: "Generate Auth URL", type: "main", index: 0 }
                ]
            ]
        },
        "Generate Auth URL": {
            main: [
                [
                    { node: "Send Auth Email", type: "main", index: 0 }
                ]
            ]
        }
    },
    settings: {
        saveDataErrorExecution: "all",
        saveDataSuccessExecution: "all",
        saveExecutionProgress: true,
        saveManualExecutions: true,
        callerPolicy: "workflowsFromSameOwner"
    }
};

// ---------------------------------------------------------
// WORKFLOW 2: OAuth Callback Handler (Receives Token)
// ---------------------------------------------------------
const oauthCallbackHandlerWorkflow = {
    name: "OAuth Callback Handler",
    nodes: [
        {
            parameters: {
                httpMethod: "GET",
                path: "oauth-callback",
                options: {}
            },
            id: "webhook-oauth-callback",
            name: "Catch OAuth Callback",
            type: "n8n-nodes-base.webhook",
            typeVersion: 1,
            position: [100, 300],
            webhookId: "oauth-callback"
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
                        { name: "code", value: "={{$json.query.code}}" },
                        { name: "grant_type", value: "authorization_code" },
                        { name: "redirect_uri", value: "={{$env.get('N8N_BASE_URL')}}/webhook/oauth-callback" }
                    ]
                },
                options: {}
            },
            id: "exchange-token",
            name: "Exchange Code for Refresh Token",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.1,
            position: [300, 300]
        },
        {
            parameters: {
                method: "POST",
                url: "={{$env.get('NEXT_PUBLIC_APP_URL')}}/api/accounts/verified",
                sendBody: true,
                specifyBody: "json",
                jsonBody: "={\n  \"email\": \"{{$node['Catch OAuth Callback'].json.query.state}}\",\n  \"refreshToken\": \"{{$json.refresh_token}}\"\n}",
                options: {}
            },
            id: "sync-to-nextjs",
            name: "Sync to Next.js",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.1,
            position: [500, 300]
        }
    ],
    connections: {
        "Catch OAuth Callback": {
            main: [
                [
                    { node: "Exchange Code for Refresh Token", type: "main", index: 0 }
                ]
            ]
        },
        "Exchange Code for Refresh Token": {
            main: [
                [
                    { node: "Sync to Next.js", type: "main", index: 0 }
                ]
            ]
        }
    },
    settings: {}
};

async function deployWorkflow(workflowObj) {
    console.log(`\nDeploying: ${workflowObj.name}...`);
    try {
        const createRes = await fetch(`${n8nBase}/api/v1/workflows`, {
            method: 'POST',
            headers: { 'X-N8N-API-KEY': n8nKey, 'Content-Type': 'application/json' },
            body: JSON.stringify(workflowObj)
        });

        const createdWorkflow = await createRes.json();

        if (!createRes.ok) {
            console.error(`Failed to create ${workflowObj.name}:`, createdWorkflow);
            return;
        }

        console.log(`Created ID: ${createdWorkflow.id}`);

        const actRes = await fetch(`${n8nBase}/api/v1/workflows/${createdWorkflow.id}/activate`, {
            method: 'POST',
            headers: { 'X-N8N-API-KEY': n8nKey }
        });

        if (actRes.ok) {
            console.log(`Successfully activated: ${workflowObj.name}`);
        } else {
            console.error(`Failed to activate ${workflowObj.name}`);
        }

    } catch (e) {
        console.error(`Network error deploying ${workflowObj.name}:`, e);
    }
}

async function run() {
    await deployWorkflow(authLinkGeneratorWorkflow);
    await deployWorkflow(oauthCallbackHandlerWorkflow);
    console.log("\nDeployment Process Complete.");
}

run();
