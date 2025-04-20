

```md

<p align="center">
  <img src="https://github.com/rajanprajapati1/PDF-ChatBot/blob/main/demo/Screenshot%20(12).png?raw=true" alt="PDF ChatBot Screenshot" width="700"/>
</p>


# 📄 PDF ChatBot




Welcome to **PDF ChatBot** — an AI-powered PDF summarizer and chatbot built using **Next.js**, **TailwindCSS**, **LangChain**, **Pinecone**, and **OPEN AI**. Upload any PDF and interact with it like a pro using natural language.

---

## 🚀 Features

- 📁 Upload and extract text from PDF files
- 🧠 Get AI-generated summaries using **openai**
- 💬 Chat with PDFs using **LangChain** and **Pinecone vector search**
- ⚡ Beautiful and responsive UI using **Radix UI**, **ShadCN UI**, and **TailwindCSS**

---

## 🧱 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) `v15`
- **UI Libraries**: [Radix UI](https://www.radix-ui.com/), [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: TailwindCSS, tailwind-merge, tailwindcss-animate
- **AI & Embedding**:
  - [LangChain](https://www.langchain.com/)
  - [CHAT SDK](https://www.groq.com/)
  - [Pinecone Vector DB](https://www.pinecone.io/)
- **PDF Parsing**: [pdf-parse](https://www.npmjs.com/package/pdf-parse)

---

## 🔑 Getting API Keys

### 🔹 Pinecone API Key

1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Sign in or create an account.
3. Create a new **index** (choose dimension = `1024`, metric = `cosine`, and serverless region like `us-east-1-aws`)
4. Go to **API Keys** → Copy your **environment**, **project name**, and **API key**



## 🛠️ Project Setup

### 1. Clone the repo

```bash
git clone https://github.com/your-username/pdf-chatbot.git
cd pdf-chatbot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env.local` file in the root and add:

```env
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX_NAME=your-pinecone-index-name
PINECONE_PROJECT_NAME=your-pinecone-project-name

OPENAPI_API_KEY=your-OPENAI-api-key
```

### 4. Start the dev server

```bash
npm run dev
```

Visit `http://localhost:3000` to use the chatbot.

---

## 🧩 Components Overview

- `PDFUploader`: Handles file selection and PDF parsing
- `SummaryViewer`: Displays summary from LLM
- `PDFChat`: Enables chat with the uploaded document
- `Tabs`: Switch between summary and chat views using Radix UI

---

## 📦 Build for Production

```bash
npm run build
npm start
```

---

## 🤝 Contributing

If you'd like to contribute or suggest improvements, feel free to open issues or PRs. All kinds of help are welcome!

---

## 📜 License

MIT License © 2025 Rajan Prajapati
