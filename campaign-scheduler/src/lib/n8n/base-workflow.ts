/**
 * This file represents a simplified baseline structure of the target n8n workflow.
 * The Next.js backend uses this structure to generate a new iteration of the campaign securely, 
 * injecting dynamically the user's frontend criteria (e.g. limit per account, delays, schedule).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getBaseWorkflowTemplate = (campaignName: string, config: any) => {
    return {
        name: campaignName,
        settings: {
            saveDataErrorExecution: "all",
            saveDataSuccessExecution: "none",
            saveExecutionProgress: true,
            saveManualExecutions: false,
            callerPolicy: "workflowsFromSameOwner"
        },
        // The nodes structure is a simplified representation. 
        // In production, you would export your actual node array from n8n 
        // and map the parameters programmatically.
        nodes: [
            {
                parameters: {
                    rule: {
                        interval: [
                            {
                                field: "cronExpression",
                                // This is a placeholder showing where injection happens
                                expression: `* ${config.startTime.split(':')[0]} * * *`
                            }
                        ]
                    }
                },
                id: "schedule-trigger-node",
                name: "Schedule Trigger",
                type: "n8n-nodes-base.scheduleTrigger",
                typeVersion: 1.1,
                position: [0, 0]
            },
            {
                parameters: {
                    // Dynamic parameters injected here
                    limit: config.dailyLimitPerAccount,
                    accounts: config.activeAccounts,
                    timeWindowEnd: config.endTime
                },
                id: "distribution-logic",
                name: "Distribution Engine",
                type: "n8n-nodes-base.code",
                typeVersion: 2,
                position: [200, 0]
            },
            {
                parameters: {
                    amount: config.minDelay, // For true random, n8n Wait node or code node can be configured
                    unit: "minutes"
                },
                id: "random-delay",
                name: "Wait (Delay)",
                type: "n8n-nodes-base.wait",
                typeVersion: 1,
                position: [400, 0]
            },
            {
                parameters: {
                    method: "DELETE",
                    url: `={{$env["N8N_BASE_URL"]}}/api/v1/workflows/{{$workflow.id}}`,
                    authentication: "genericCredentialType",
                    genericAuthType: "n8nApi"
                },
                id: "self-destruct",
                name: "Cleanup Workflow",
                type: "n8n-nodes-base.httpRequest",
                typeVersion: 4.1,
                position: [600, 0],
                notesInFlow: true,
                notes: "Self destructs workflow upon campaign completion"
            }
        ],
        connections: {
            "Schedule Trigger": {
                main: [
                    [
                        {
                            node: "Distribution Engine",
                            type: "main",
                            index: 0
                        }
                    ]
                ]
            },
            "Distribution Engine": {
                main: [
                    [
                        {
                            node: "Wait (Delay)",
                            type: "main",
                            index: 0
                        }
                    ]
                ]
            }
        }
    };
};
