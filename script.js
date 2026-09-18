const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const chatBox = document.getElementById("chat-box");
const typing = document.getElementById("typing");

// Chuyển Markdown cơ bản thành HTML
function formatMessage(message) {
    let text = message;

    // Gemini đôi khi escape các ký tự Markdown
    // Ví dụ: \* -> *, \. -> .
    // Không xóa các dấu \ dùng cho LaTeX như \(, \), \frac...
    text = text.replace(/\\([*_.#])/g, "$1");

    // Escape HTML để AI không thể chèn HTML trực tiếp
    text = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Code block ```...```
    text = text.replace(
        /```([\s\S]*?)```/g,
        '<pre><code>$1</code></pre>'
    );

    // Inline code `...`
    text = text.replace(
        /`([^`]+)`/g,
        '<code>$1</code>'
    );

    // Tiêu đề Markdown
    text = text.replace(
        /^### (.+)$/gm,
        "<h3>$1</h3>"
    );

    text = text.replace(
        /^## (.+)$/gm,
        "<h2>$1</h2>"
    );

    text = text.replace(
        /^# (.+)$/gm,
        "<h1>$1</h1>"
    );

    // In đậm
    text = text.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
    );

    // In nghiêng
    text = text.replace(
        /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
        "<em>$1</em>"
    );

    // Xuống dòng
    text = text.replace(/\n/g, "<br>");

    return text;
}

async function typesetMath(element) {
    if (window.MathJax) {
        try {
            await MathJax.typesetPromise([element]);
        } catch (error) {
            console.error("MathJax ERROR:", error);
        }
    }
}

function addMessage(message, type) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message " + type;

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    if (type === "bot") {
        bubble.innerHTML = formatMessage(message);
    } else {
        bubble.textContent = message;
    }

    messageDiv.appendChild(bubble);
    chatBox.appendChild(messageDiv);

    chatBox.scrollTop = chatBox.scrollHeight;

    if (type === "bot") {
        typesetMath(bubble);
    }
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