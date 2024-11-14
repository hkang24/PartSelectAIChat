import { OpenAI } from "openai";
import { getPartInformation } from "./get-part-information";
import { getAppliancePartsInformation } from "./get_appliance_parts_info";

// handles the generation of the agent response
export async function POST(req: Request) {
    const body = await req.json();
    const { message, threadId } = body;
    
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Create a thread only if threadId is not provided
        const thread = threadId 
            ? { id: threadId }
            : await openai.beta.threads.create();

        // Add the user's message to the thread
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: message,
        });

        // Run the assistant on the thread
        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: "asst_If0OK8DSPEZJsY8dg9F60XLh",
        });

        // Wait for the run to complete
        let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        while (runStatus.status !== "completed") {
            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            
            if (runStatus.status === "requires_action") {
                const toolCalls = runStatus.required_action?.submit_tool_outputs.tool_calls;
                console.log("requires_action , ", toolCalls);
                if (toolCalls) {
                    const toolOutputs = await Promise.all(toolCalls.map(async (toolCall) => {
                        // Here you would implement the actual function calling logic
                        const result = await handleFunctionCall(toolCall);
                        // const result = "test";

                        return {
                            tool_call_id: toolCall.id,
                            output: JSON.stringify(result),
                        };
                    }));

                    // Submit the results back to the assistant
                    runStatus = await openai.beta.threads.runs.submitToolOutputs(
                        thread.id,
                        run.id,
                        { tool_outputs: toolOutputs }
                    );
                }
            }
            
            if (runStatus.status === "failed") {
                throw new Error("Assistant run failed");
            }
        }

        // Get the assistant's response
        const messages = await openai.beta.threads.messages.list(thread.id);
        const assistantResponse = messages.data[0].content[0];
        
        
        if ('text' in assistantResponse) {
            const cleanedResponse = assistantResponse.text.value.replace(/<\/?div>/g, '');
            console.log(cleanedResponse)
            return new Response(JSON.stringify({
                message: cleanedResponse,
                threadId: thread.id,
            }));
        }
        
        return new Response(JSON.stringify({ 
            error: 'Unexpected response format' 
        }), { status: 500 });
    } catch (error) {
        console.error('OpenAI API error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate response' }), 
            { status: 500 });
    }
}   

// handles the function calls from the assistant
async function handleFunctionCall(toolCall: { function: { name: string, arguments: string } }) {
    const functionName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);
    console.log("functionName: ", functionName);
    console.log("args: ", args);
    
    const functionMap: Record<string, (args: any) => Promise<any>> = {
        get_part_information: getPartInformation,
        get_appliance_parts_info: getAppliancePartsInformation,
    };

    if (functionName in functionMap) {
        return await functionMap[functionName](args);
    }
    
    throw new Error(`Function ${functionName} not implemented`);
}