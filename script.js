// --- SCRIPT START ---
console.log("--- script.js loaded and executing ---");

// ================== THIS IS THE ONLY LINE YOU EVER NEED TO CHANGE ==================
const API_URL = "https://8fa60ee5f9de.ngrok-free.app";
// ===================================================================================

// --- ELEMENT GRAB & VALIDATION ---
const statusIndicator = document.getElementById('status-indicator');
const messagesDiv = document.getElementById('messages');
const usernameInput = document.getElementById('username-input');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
console.log("DEBUG: All HTML element variables created.");

// --- STATUS UPDATE FUNCTION ---
function setStatus(status, message) {
    console.log(`STATUS UPDATE: ${status.toUpperCase()}` + (message ? ` - ${message}` : ''));
    statusIndicator.className = 'status-' + status;
    statusIndicator.title = status.charAt(0).toUpperCase() + status.slice(1);
}

// --- CORE CHAT FUNCTIONS ---
async function fetchMessages() {
    setStatus('connecting', 'Fetching messages...');
    try {
        const url = `${API_URL}/messages`;
        console.log(`[FETCH] Starting request to: ${url}`);
        
        const response = await fetch(url);
        console.log(`[FETCH] Response received. Status: ${response.status}`);

        // THE MOST IMPORTANT DEBUGGING STEP: Clone the response to log its raw text.
        const responseClone = response.clone();
        const rawText = await responseClone.text();
        console.log(`[FETCH] Raw text from server (first 500 chars):`, rawText.substring(0, 500));

        if (!response.ok) {
            throw new Error(`Server returned a non-OK status: ${response.status}`);
        }
        
        // Now, try to parse the original response as JSON.
        const messages = await response.json();
        console.log(`[FETCH] Successfully parsed JSON. Found ${messages.length} messages.`);
        
        // Render the messages on the page
        let messagesHTML = '';
        const myUsername = usernameInput.value.trim();
        
        messages.forEach(msg => {
            const isMyMessage = myUsername && msg.username === myUsername;
            const messageClass = isMyMessage ? 'my-message' : 'other-message';
            messagesHTML += `
                <div class="message-wrapper ${messageClass}">
                    <div class="username">${escapeHTML(msg.username)}</div>
                    <div class="text">${escapeHTML(msg.text)}</div>
                </div>
            `;
        });
        messagesDiv.innerHTML = messagesHTML;
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to bottom
        setStatus('connected', 'Messages loaded successfully.');

    } catch (error) {
        setStatus('disconnected', `Error: ${error.message}`);
        console.error("--- [FETCH] FAILED ---", error);
        messagesDiv.innerHTML = `<div class="message-wrapper error-message"><div class="text"><strong>Could not display messages.</strong><br>Check the F12 console for the exact error.</div></div>`;
    }
}

async function sendMessage() {
    const username = usernameInput.value.trim();
    const text = messageInput.value.trim();

    if (!username || !text) {
        alert('Please enter your name and a message!');
        return;
    }

    const messageData = { username, text };
    setStatus('connecting', 'Sending message...');
    
    try {
        const url = `${API_URL}/send`;
        console.log(`[SEND] Starting POST request to: ${url}`, messageData);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
        });
        console.log(`[SEND] Response received. Status: ${response.status}`);
        
        if (!response.ok) { throw new Error(`Server returned status ${response.status}`); }
        
        messageInput.value = ''; // Clear input box
        console.log("[SEND] Message sent successfully. Now fetching updated messages.");
        await fetchMessages(); // Await to ensure status updates correctly
        
    } catch (error) {
        setStatus('disconnected', `Error: ${error.message}`);
        console.error("--- [SEND] FAILED ---", error);
        alert("Failed to send message. See console for details.");
    }
}
function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// --- SETUP & INITIALIZATION ---
console.log("DEBUG: Setting up event listeners and timers...");
sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

// Fetch messages every 5 seconds
setInterval(fetchMessages, 5000);

// Perform the first fetch immediately
console.log("DEBUG: Performing initial fetch on page load.");
fetchMessages();

console.log("--- script.js setup complete. Waiting for events. ---");