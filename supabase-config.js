// supabase-config.js

const SUPABASE_URL = 'https://pmsiamjzrubpyvktwcyl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtc2lhbWp6cnVicHl2a3R3Y3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwODI2NDksImV4cCI6MjA3OTY1ODY0OX0.j58aGgmwmPzne9TZ1xD9VwHNnBuzxGz8hB4bqODPoNg';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
    }
});
window.supabase = client;

// --- AUTH CHECKER ---
async function checkAuth() {
    return new Promise((resolve) => {
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (window.firebaseAuth && window.firebaseAuth.currentUser) {
                clearInterval(checkInterval);
                const user = window.firebaseAuth.currentUser;
                resolve({ user: { id: user.uid, email: user.email } });
            } else if (attempts > 50) { 
                if(window.checkFirebaseAuth) {
                     window.checkFirebaseAuth(u => {
                        clearInterval(checkInterval);
                        resolve(u ? { user: { id: u.uid, email: u.email } } : null);
                     });
                } else {
                    clearInterval(checkInterval);
                    resolve(null);
                }
            }
        }, 100);
    });
}

async function logoutUser() {
    if (window.firebaseLogout) await window.firebaseLogout();
    else window.location.replace('login.html');
}

// --- SMART ENCRYPTION/DECRYPTION ---

// Helper: Convert Buffer to Base64 (Safe for all browsers)
function bufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Helper: Convert Base64 to Buffer
function base64ToBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

async function encryptMessage(text, secret) {
    try {
        const enc = new TextEncoder();
        const key = await importKey(secret);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, enc.encode(text));
        
        return JSON.stringify({ 
            iv: bufferToBase64(iv), 
            data: bufferToBase64(encrypted) 
        });
    } catch (e) { 
        console.error("Encryption Failed:", e);
        return text; 
    }
}

async function decryptMessage(cipherText, secret) {
    if (!cipherText) return "";

    try {
        // 1. Try Standard AES-GCM Decryption
        if (cipherText.startsWith('{')) {
            const raw = JSON.parse(cipherText);
            const key = await importKey(secret);
            const iv = base64ToBuffer(raw.iv);
            const data = base64ToBuffer(raw.data);
            
            const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
            return new TextDecoder().decode(decrypted);
        }
        
        // 2. Fallback: Check if it's just Base64 (Like your 'SGVsbG8=' case)
        // "SGVsbG8=" -> "Hello"
        try {
            const decoded = atob(cipherText);
            // Agar decode karke readable text lag raha hai, to return karo
            if (/^[\x20-\x7E]*$/.test(decoded)) {
                return decoded;
            }
        } catch (err) {
            // Not base64, ignore
        }

        // 3. Last Resort: Return as is (Plain Text)
        return cipherText;

    } catch (e) {
        // console.error("Decryption Failed:", e);
        // Agar fail hua, toh shayad purana plain text message hai
        return cipherText; 
    }
}

async function importKey(secret) {
    const enc = new TextEncoder();
    // Key ko consistent banane ke liye HASH karte hain
    const keyData = await window.crypto.subtle.digest("SHA-256", enc.encode(secret));
    return await window.crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

// --- RINGTONE ---
let ringtoneAudio = new Audio('incoming.mp3');
ringtoneAudio.loop = true;
function playRingtone() { ringtoneAudio.currentTime = 0; ringtoneAudio.play().catch(e => console.log("Audio needed")); }
function stopRingtone() { ringtoneAudio.pause(); ringtoneAudio.currentTime = 0; }