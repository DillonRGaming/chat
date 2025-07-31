console.log("--- script.js loaded ---");

// ================== THIS IS THE ONLY LINE YOU EVER NEED TO CHANGE ==================
const API_URL = "https://c3c423fd6549.ngrok-free.app";
console.log("CONFIG: API_URL is set to:", API_URL);
// ===================================================================================

// --- Finding our HTML elements ---
const messagesDiv = document.getElementById('messages');
const usernameInput = document.getElementById('username');
const textInput = document.getElementById('message-text');
const sendButton = document.getElementById('send-button');

if (!messagesDiv || !usernameInput || !textInput || !sendButton) {
    console.error("FATAL: Could not find one or more required HTML elements on the page.");
} else {
    console.log("SUCCESS: All HTML elements found.");
}


// --- Core Functions ---

async function fetchMessages() {
    console.log(`[FETCH] Attempting to GET messages from: ${API_URL}/messages`);
    try {
        const response = await fetch(API_URL + '/messages');
        console.log(`[FETCH] Got response from server. Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            throw new Error(`Server returned a non-200 status: ${response.status}`);
        }

        // This is the most likely point of failure. We will wrap it in its own try/catch.
        let messages;
        try {
            messages = await response.json();
            console.log(`[FETCH] Successfully parsed JSON. Found ${messages.length} messages.`);
        } catch (jsonError) {
            console.error("[FETCH] CRITICAL ERROR: Server response was NOT valid JSON.", jsonError);
            throw new Error("Failed to parse server response as JSON.");
        }
        
        // If we get here, everything worked. Now we update the page.
        let messagesHTML = '';
        messages.slice().reverse().forEach(msg => {
            messagesHTML += `
                <div class="message-wrapper">
                    <div class="username">${escapeHTML(msg.username)}</div>
                    <div class="text">${escapeHTML(msg.text)}</div>
                </div>
            `;
        });
        messagesDiv.innerHTML = messagesHTML;
        console.log("[FETCH] Successfully updated the chat display.");

    } catch (error) {
        console.error("--- FETCH MESSAGES FAILED ---", error);
        messagesDiv.innerHTML = `<div class="message-wrapper"><div class="text error-message"><strong>Error:</strong> Could not retrieve messages. Check the browser console (F12) for details.</div></div>`;
    }
}

async function sendMessage() {
    if (!usernameInput.value || !textInput.value) {
        alert('Please enter your name and a message!');
        return;
    }
    const messageData = { 
        username: usernameInput.value, 
        text: textInput.value 
    };

    console.log(`[SEND] Attempting to POST to: ${API_URL}/send with data:`, messageData);

    try {
        const response = await fetch(API_URL + '/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
        });
        console.log(`[SEND] Got response from server. Status: ${response.status}`);
        textInput.value = ''; // Clear input box
        console.log("[SEND] Message sent. Triggering immediate refresh of messages.");
        fetchMessages(); // Refresh messages immediately after sending
    } catch (error) {
        console.error("--- SEND MESSAGE FAILED ---", error);
        alert("Failed to send message. Check the console for details.");
    }
}
function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// --- Event Listeners and Timers ---
console.log("Setting up event listeners and timers...");

sendButton.addEventListener("click", sendMessage);

textInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

// Check for new messages every 5 seconds (slightly longer interval)
setInterval(fetchMessages, 5000);

// Load messages immediately when the page opens
console.log("Performing initial message fetch...");
fetchMessages();

console.log("--- script.js setup complete ---");