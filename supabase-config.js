// supabase-config.js

// 1. Supabase Client Initialization with YOUR Credentials
const SUPABASE_URL = 'https://pmsiamjzrubpyvktwcyl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtc2lhbWp6cnVicHl2a3R3Y3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwODI2NDksImV4cCI6MjA3OTY1ODY0OX0.j58aGgmwmPzne9TZ1xD9VwHNnBuzxGz8hB4bqODPoNg';

// Client create karein
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
// Global variable set karein taaki baaki files access kar sakein
window.supabase = client;

// 2. Helper Function: Check if user is logged in
async function checkAuth() {
    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        return session;
    } catch (error) {
        console.error("Auth Error:", error);
        return null;
    }
}

// 3. Helper Function: Logout
async function logoutUser() {
    await window.supabase.auth.signOut();
    window.location.href = 'login.html';
}

// ---------------------------------------------------------
// 4. END-TO-END ENCRYPTION HELPERS (AES-GCM)
// ---------------------------------------------------------

// Message Encrypt karne ke liye
async function encryptMessage(text, secret) {
    try {
        const enc = new TextEncoder();
        const key = await importKey(secret);
        // Random Initialization Vector (IV) generate karein
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        const encrypted = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key,
            enc.encode(text)
        );

        // Data ko String mein convert karein taaki DB mein save ho sake
        const ivStr = btoa(String.fromCharCode(...iv));
        const dataStr = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
        
        // JSON format mein return karein
        return JSON.stringify({ iv: ivStr, data: dataStr });
    } catch (e) {
        console.error("Encryption Failed:", e);
        return text; // Fallback to plain text if fails
    }
}

// Message Decrypt karne ke liye
async function decryptMessage(cipherText, secret) {
    try {
        // Agar message JSON nahi hai (yani purana message hai), toh direct return karo
        if (!cipherText.startsWith('{')) return cipherText;

        const raw = JSON.parse(cipherText);
        const key = await importKey(secret);
        
        const iv = Uint8Array.from(atob(raw.iv), c => c.charCodeAt(0));
        const data = Uint8Array.from(atob(raw.data), c => c.charCodeAt(0));
        
        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            key,
            data
        );
        
        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.error("Decryption Failed:", e);
        return "🔒 Encrypted Message"; 
    }
}

// Secret Key Generate karne ke liye
async function importKey(secret) {
    const enc = new TextEncoder();
    const keyData = await window.crypto.subtle.digest("SHA-256", enc.encode(secret));
    return await window.crypto.subtle.importKey(
        "raw", 
        keyData, 
        { name: "AES-GCM" }, 
        false, 
        ["encrypt", "decrypt"]
    );
}

// ---------------------------------------------------------
// 5. RINGTONE MANAGER (Incoming Call Sound)
// ---------------------------------------------------------

let ringtoneAudio = new Audio('incoming.mp3');
ringtoneAudio.loop = true; // Ringtone lagataar bajegi

function playRingtone() {
    ringtoneAudio.currentTime = 0;
    // Browser policy ke wajah se kabhi kabhi auto-play block ho sakta hai
    ringtoneAudio.play().catch(e => console.log("User interaction needed for audio:", e));
}

function stopRingtone() {
    ringtoneAudio.pause();
    ringtoneAudio.currentTime = 0;
}