// background.js

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Set up the side panel behavior
chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({
        openPanelOnActionClick: true 
    }).catch((error) => console.error("Error setting side panel behavior:", error));
});

// Function to build the specialized Gemini Prompt
function getSpecializedPrompt(mode, text) {
    let systemInstruction = "";
    
    if (mode === "Sales") {
        systemInstruction = "You are a Sales Copywriting Expert. Analyze the user's selected text for weak calls-to-action (CTAs), tentative language, or lack of urgency. Rewrite it to be persuasive, direct, and confident, focusing on clear next steps or value proposition.";
    } else if (mode === "Legal") {
        systemInstruction = "You are a Contractual Review Attorney. Analyze the user's selected text for ambiguity, passive voice, and unnecessary redundancy. Rewrite the text to be precise, active, and concise, suitable for formal legal documentation. Provide only the corrected text.";
    } else if (mode === "Technical") {
        systemInstruction = "You are a Senior Technical Editor. Analyze the user's selected text for excessive jargon, complexity, and common style guide violations. Rewrite it to be simple, direct, and focused on clear instructions for an engineering audience. Provide only the simplified text.";
    } else { // General Mode
        systemInstruction = "You are a General Clarity Expert. Provide one highly concise and clear alternative to the user's selected text, focusing on better grammar and readability. Provide only the rewritten text.";
    }

    const userPrompt = `Analyze and rewrite the following text based on the professional context of ${mode}. The original text is: "${text}". Provide only the rewritten text, do not include any explanatory commentary, introduction, or markdown formatting around the output.`;

    return { systemInstruction, userPrompt };
}

// Listener for messages from content.js (the AI request)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "REQUEST_AI_SUGGESTION") {
        
        // 1. Get the API Key
        chrome.storage.local.get(['geminiApiKey'], async (result) => {
            const apiKey = result.geminiApiKey;
            
            if (!apiKey) {
                sendResponse({ success: false, error: "API Key not configured. Please set it in ClarityPro Options." });
                return;
            }

            // 2. Build the specialized prompt
            const { systemInstruction, userPrompt } = getSpecializedPrompt(request.mode, request.text);

            const requestBody = {
                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.2, // Low temperature for professional, deterministic output
                    maxOutputTokens: 500 
                }
            };

            // 3. Call the Gemini API
            try {
                const apiResponse = await fetch(GEMINI_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': apiKey 
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!apiResponse.ok) {
                    throw new Error(`API call failed with status: ${apiResponse.status}`);
                }

                const json = await apiResponse.json();
                
                // Extract the generated text
                const generatedText = json.candidates[0].content.parts[0].text.trim();
                
                sendResponse({ success: true, data: { suggestion: generatedText } });
                
            } catch (error) {
                console.error("Gemini API Error:", error);
                sendResponse({ success: false, error: "Failed to connect to the AI. Check your API key or network." });
            }
        });

        return true; // Indicates asynchronous response
    }
});
