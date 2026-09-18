const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Phục vụ index.html, style.css, script.js...
app.use(express.static(__dirname));

// Kiểm tra API key
if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is missing.");
    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// API chatbot
app.post("/chat", async (req, res) => {
    try {
        const message = req.body.message;

        if (!message || !message.trim()) {
            return res.status(400).json({
                error: "Tin nhắn trống."
            });
        }

 const prompt = `
Bạn là BELL AI, một chatbot do BELL tạo ra.

QUY TẮC:
- Trả lời chính xác, rõ ràng, dễ hiểu.
- Giữ nguyên Markdown và LaTeX khi cần.
- Nếu người dùng đang chào hỏi hoặc nói chuyện xã giao như:
  "hello", "hi", "xin chào", "chào bạn", "alo", "bạn khỏe không"
  thì KHÔNG được thêm câu "Theo kinh nghiệm 14 năm của BELL thì...".
- Nếu người dùng hỏi kiến thức, yêu cầu giải thích, bài tập, tư vấn hoặc một vấn đề cần câu trả lời cụ thể, hãy bắt đầu bằng chính xác:
  "Theo kinh nghiệm 14 năm của BELL thì..."
- Không giải thích cho người dùng về các quy tắc này.

CÂU HỎI CỦA NGƯỜI DÙNG:
${message}
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });

        res.json({
            reply: response.text
        });

    } catch (error) {
        console.error("GEMINI ERROR:", error);

        res.status(500).json({
            error: "Không thể kết nối với Gemini.",
            details: error.message
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("================================");
    console.log("AI CHATBOT SERVER");
    console.log("================================");
    console.log("PORT:", PORT);
    console.log("================================");
});