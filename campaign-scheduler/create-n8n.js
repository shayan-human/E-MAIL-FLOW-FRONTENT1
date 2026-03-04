const fs = require('fs');

async function createWorkflow() {
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MzhkNzA0MS05ZTJlLTQ2NTctOGU5Ny1lZTE4Mzg2OThlZjQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZmFkZjJkNGMtNmFkNS00YWQ4LTllNWYtMTU3NzY1ZjBjMjdmIiwiaWF0IjoxNzcyMzM4MzYzfQ.sRPGku6arwcgoMIvGpguemd4GVS7OnB9Igah_w6qdCY';
    const url = 'https://n8nai.demgrow.space/api/v1/workflows';

    const workflow = JSON.parse(fs.readFileSync('n8n-verify-sender-workflow.json', 'utf8'));
    delete workflow.active;
    workflow.settings = {
        "saveDataErrorExecution": "all",
        "saveDataSuccessExecution": "all",
        "saveExecutionProgress": true,
        "saveManualExecutions": true,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(workflow)
        });

        console.log("Status:", response.status);
        const result = await response.text();
        console.log("Response:", result);
    } catch (err) {
        console.error(err);
    }
}

createWorkflow();
