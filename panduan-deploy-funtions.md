# PANDUAN DEPLOY FIREBASE CLOUD FUNCTIONS
# Pareffi Store — Elara AI Assistant
# =====================================

## STRUKTUR FOLDER
```
pareffi/                    ← root project kamu
├── index.html
├── store.html
├── chat.html
├── ...file HTML lainnya...
├── Css/
├── img/
├── firebase.json           ← buat file ini
├── .firebaserc             ← buat file ini
└── functions/              ← folder baru
    ├── index.js            ← sudah dibuat
    └── package.json        ← sudah dibuat
```

---

## LANGKAH 1 — Install Firebase CLI
Buka terminal/command prompt di laptop:
```bash
npm install -g firebase-tools
```

---

## LANGKAH 2 — Login Firebase
```bash
firebase login
```
Akan terbuka browser → login dengan akun Google kamu.

---

## LANGKAH 3 — Init Project
Di folder root project kamu:
```bash
firebase init functions
```
Pilih:
- Use existing project → pareffi-store
- Language: JavaScript
- ESLint: No
- Install dependencies: Yes

---

## LANGKAH 4 — Simpan API Key Claude (AMAN)
```bash
firebase functions:config:set claude.api_key="API_KEY_CLAUDE_KAMU"
```
Ganti API_KEY_CLAUDE_KAMU dengan key dari console.anthropic.com

---

## LANGKAH 5 — Install node-fetch
```bash
cd functions
npm install node-fetch@2
cd ..
```

---

## LANGKAH 6 — Deploy
```bash
firebase deploy --only functions
```

---

## LANGKAH 7 — Buat firebase.json
Buat file `firebase.json` di root project:
```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "functions/**"
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  }
}
```

---

## LANGKAH 8 — Buat .firebaserc
Buat file `.firebaserc` di root project:
```json
{
  "projects": {
    "default": "pareffi-store"
  }
}
```

---

## SETELAH DEPLOY BERHASIL
Cloud Function kamu akan aktif di:
```
https://asia-southeast1-pareffi-store.cloudfunctions.net/chatWithElara
```

chat.html sudah otomatis terhubung ke Cloud Function ini.
API key Claude TIDAK akan terekspos ke frontend. ✅

---

## CARA DAPAT API KEY CLAUDE
1. Buka console.anthropic.com
2. Login / daftar
3. Klik "API Keys" → Create Key
4. Copy key → paste di Langkah 4

---

## BIAYA
- Firebase Functions: GRATIS sampai 2 juta invokasi/bulan
- Claude Haiku: ~$0.25 per 1 juta token (sangat murah)
