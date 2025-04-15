// src/pages/ChatPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import { ChatMessage as MessageType } from '../types';
import './ChatPage.css'; // Import CSS

// --- PERINGATAN KEAMANAN KRITIS ---
// Menyimpan API Key langsung di kode sisi klien (browser) SANGAT TIDAK AMAN.
// Siapapun bisa melihat key Anda melalui inspect element atau network tab.
// Ini HANYA untuk demo pribadi dan sementara. JANGAN gunakan di produksi.
// Untuk aplikasi nyata, GUNAKAN BACKEND untuk menangani panggilan API.
// Ganti 'YOUR_OPENAI_API_KEY_FALLBACK' HANYA untuk demo ini.
// Sangat disarankan menggunakan Environment Variable (lihat Langkah 6).
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_FALLBACK';

if (apiKey === 'YOUR_OPENAI_API_KEY_FALLBACK' || !apiKey) {
   console.error("OpenAI API Key tidak ditemukan! Mohon set VITE_OPENAI_API_KEY di file .env Anda.");
   // Idealnya tampilkan pesan error ke pengguna di UI
}

// Konfigurasi OpenAI Client
const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Diperlukan untuk browser, menegaskan risiko keamanan
});

const CHAT_LIMIT = 5; // Batas 5 input pengguna
const MODEL_NAME = "gpt-4.1-mini"; // Gunakan model gpt-4.1-mini

const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [userMessageCount, setUserMessageCount] = useState<number>(0);
    const messagesEndRef = useRef<null | HTMLDivElement>(null); // Untuk auto-scroll

    // Fungsi untuk scroll ke bawah
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Panggil scrollToBottom setiap kali messages berubah
    useEffect(scrollToBottom, [messages]);

    // Fungsi untuk menangani pengiriman pesan
    const handleSendMessage = async (userInput: string) => {
        if (userMessageCount >= CHAT_LIMIT) {
            setError("Batas pengiriman pesan telah tercapai.");
            return; // Hentikan jika batas tercapai
        }

        // 1. Tambahkan pesan user ke state
        const newUserMessage: MessageType = { role: 'user', content: userInput };
        // Ambil semua pesan sebelumnya, tambahkan pesan user baru
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);

        // 2. Tambah hitungan pesan user
        setUserMessageCount(prevCount => prevCount + 1);

        // 3. Set loading & reset error
        setIsLoading(true);
        setError(null);

        // 4. Persiapan data untuk API OpenAI
        // Kirim semua pesan sebelumnya agar AI punya konteks
        // Filter pesan 'system' jika ada, OpenAI API menangani role 'system' secara khusus di awal
        const apiMessages = updatedMessages
          .filter(msg => msg.role !== 'system') // Hapus pesan sistem dari history jika ada
          .map(({ role, content }) => ({ role, content }));

        // Opsional: Tambahkan pesan sistem di awal jika diperlukan
        // apiMessages.unshift({ role: 'system', content: 'Anda adalah asisten yang membantu.' });

        try {
            console.log(`Mengirim request ke OpenAI model: ${MODEL_NAME}`);
            // 5. Panggil API OpenAI
            const completion = await openai.chat.completions.create({
                messages: apiMessages,
                model: MODEL_NAME,
            });

            console.log("Respons OpenAI:", completion); // Untuk debugging

            // 6. Proses respons dan tambahkan ke state
            if (completion.choices && completion.choices.length > 0 && completion.choices[0].message?.content) {
               const assistantMessage: MessageType = {
                   role: 'assistant',
                   content: completion.choices[0].message.content.trim(),
               };
               // Tambahkan respons AI ke state messages
               setMessages(prevMessages => [...prevMessages, assistantMessage]);
            } else {
               // Tangani jika struktur respons tidak sesuai harapan
               console.error("Struktur respons OpenAI tidak valid:", completion);
               throw new Error("Menerima struktur respons yang tidak valid dari AI.");
            }

        } catch (err: any) {
            // 7. Tangani error API
            console.error("Error saat memanggil OpenAI API:", err);
            const errorMessage = `Gagal mendapatkan respons dari AI: ${err.message || 'Error tidak diketahui'}`;
            setError(errorMessage);
            // Opsional: Tambahkan pesan error sebagai pesan AI
            const errorBotMessage: MessageType = { role: 'assistant', content: `Error: ${errorMessage}` };
            setMessages(prevMessages => [...prevMessages, errorBotMessage]);

        } finally {
            // 8. Set loading selesai (baik sukses maupun error)
            setIsLoading(false);
        }
    };

    // Kondisi input nonaktif
    const isInputDisabled = isLoading || userMessageCount >= CHAT_LIMIT;

    return (
        <div className="chat-page">
            {/* <Header /> Jika Anda punya komponen Header */}
            <div className="chat-messages">
                {/* Render semua pesan */}
                {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                ))}
                {/* Tampilkan indikator loading */}
                {isLoading && <div className="loading-indicator">AI sedang berpikir...</div>}
                {/* Tampilkan pesan error jika ada */}
                {error && <div className="error-message">{error}</div>}
                {/* Elemen kosong untuk tujuan scroll */}
                 <div ref={messagesEndRef} />
            </div>
            <ChatInput
                onSendMessage={handleSendMessage}
                disabled={isInputDisabled}
                messageCount={userMessageCount}
                limit={CHAT_LIMIT}
            />
        </div>
    );
};

export default ChatPage;
