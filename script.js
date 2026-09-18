const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const chatBox = document.getElementById("chat-box");
const typing = document.getElementById("typing");

function addMessage(message, type) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message " + type;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = message;

    messageDiv.appendChild(bubble);
    chatBox.appendChild(messageDiv);

    chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = messageInput.value.trim();

    if (!message) {
        return;
    }

    addMessage(message, "user");

    messageInput.value = "";
    typing.style.display = "block";

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.details ||
                data.error ||
                "Server trả về lỗi."
            );
        }

        addMessage(data.reply, "bot");

    } catch (error) {
        console.error("CHAT ERROR:", error);

        addMessage(
            "❌ Không kết nối được với AI.\n\n" +
            error.message,
            "bot"
        );

    } finally {
        typing.style.display = "none";
    }
});