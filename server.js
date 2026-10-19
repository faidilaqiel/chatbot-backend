require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();

app.use(cors({
    origin: 'https://perpustakaan-sdn-pengampon3-production.up.railway.app',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Key dipanggil dari Environment Variable (process.env)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Pesan kosong.' });

        // Model yang valid
        const model = 'gemini-3.8-flash';
        
        const result = await ai.models.generateContent({
            model: model,
            contents: message,
            config: {
                systemInstruction: "Anda adalah asisten perpustakaan digital SDN Pengampon 3. Jawablah dengan ramah dan singkat.",
            }
        });

        // Ekstraksi teks yang aman
        let replyText = '';
        if (result && typeof result.text === 'string') {
            replyText = result.text;
        } else if (result && result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts[0]) {
            replyText = result.candidates[0].content.parts[0].text;
        }

        if (!replyText) {
            replyText = 'Maaf, saya sedang tidak bisa memproses jawaban. Coba tanyakan hal lain.';
        }

        res.json({ reply: replyText });

    } catch (error) {
        console.error('Error Gemini:', error);
        res.status(500).json({ error: 'Maaf, terjadi kesalahan pada server AI.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Chatbot berjalan di port ${PORT}`);
});