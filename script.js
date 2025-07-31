// ================== THIS IS THE NEW, SIMPLIFIED API URL ==================
// Because the website and the API are now served from the same place,
// we just need the path, not the full ngrok or localtunnel address.
const API_URL = "/api";
// ========================================================================

// --- All the other code is the same as before ---
const statusIndicator = document.getElementById('status-indicator');
const messagesDiv = document.getElementById('messages');
const usernameInput = document.getElementById('username-input');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

function setStatus(status, message) {
    console.log(`STATUS UPDATE: ${status.toUpperCase()}` + (message ? ` - ${message}` : ''));
    statusIndicator.className = 'status-' + status;
    statusIndicator.title = status.charAt(0).toUpperCase() + status.slice(1);
}

async function fetchMessages() {
    setStatus('connecting', 'Fetching messages...');
    try {
        const url = `${API_URL}/messages`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Server returned status ${response.status}`);
        const messages = await response.json();
        let messagesHTML = '';
        const myUsername = usernameInput.value.trim();
        messages.forEach(msg => {
            const isMyMessage = myUsername && msg.username === myUsername;
            const messageClass = isMyMessage ? 'my-message' : 'other-message';
            messagesHTML += `<div class="message-wrapper ${messageClass}"><div class="username">${escapeHTML(msg.username)}</div><div class="text">${escapeHTML(msg.text)}</div></div>`;
        });
        messagesDiv.innerHTML = messagesHTML;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        setStatus('connected', 'Messages loaded.');
    } catch (error) {
        setStatus('disconnected', `Error: ${error.message}`);
        messagesDiv.innerHTML = `<div class="message-wrapper error-message"><div class="text"><strong>Error.</strong> Check F12 console.</div></div>`;
    }
}

async function sendMessage() {
    const username = usernameInput.value.trim();
    const text = messageInput.value.trim();
    if (!username || !text) { alert('Please enter your name and a message!'); return; }
    const messageData = { username, text };
    setStatus('connecting', 'Sending...');
    try {
        const url = `${API_URL}/send`;
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(messageData) });
        if (!response.ok) { throw new Error(`Server returned status ${response.status}`); }
        messageInput.value = '';
        await fetchMessages();
    } catch (error) {
        setStatus('disconnected', `Error: ${error.message}`);
        alert("Failed to send message.");
    }
}
function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });
setInterval(fetchMessages, 5000);
fetchMessages();