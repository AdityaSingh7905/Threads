## 🧵 Threads with Gemini
A full-stack social media platform where users can create threads, comment, interact with communities, and even generate threads using Gemini AI.
Built with modern web technologies, focused on scalability, performance, and clean UI.

## 🚀 Live Demo

## 🔗 Live Project:
👉 [https://threads-sand.vercel.app](https://threads-sand.vercel.app/)
👉 [https://threads-adityasingh7905s-projects.vercel.app](https://threads-adityasingh7905s-projects.vercel.app/)

## 🔗 Backend API:
👉 [https://threads-sl2t.onrender.com](https://threads-sl2t.onrender.com)


## ✨ Features

## 🔐 Authentication & User Management
- Secure authentication using Clerk
- Webhooks for user & community synchronization
- Zod for validation
- Uploadthing for profile image upload

## 🧵 Threads
- Create, view, and delete threads
- Comment on threads
- Nested commenting (comment on comments)
- Generate threads using Gemini AI prompts

## 👥 Communities
- Create communities
- Join and interact with other communities
- Community-based threads & discussions
- Community sync using Clerk webhooks

## 🔎 Search & Pagination
- Search users with pagination
- Search communities with pagination
- Suggested users and communities

## 🔔 Activity Feed
- Activity page showing:
  - Who commented on your threads
- Recent interactions

## 🎨 UI & UX
- Responsive & visually appealing interface
- Built with Next.js, Tailwind CSS, and shadcn/ui

## 🧠 AI Integration (Gemini)
- Users can generate threads using Gemini AI prompts
- Gemini API is integrated in the backend to create meaningful and engaging content


## 🛠 Tech Stack

## Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui – UI components
- Clerk – Authentication & Webhooks
- Zod – Form & data validation
- UploadThing – Profile image uploads

## Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- Gemini API – AI-powered thread creation

## ⚙️ Run Locally
## 1️⃣ Clone the Repository
``` bash
git clone https://github.com/AdityaSingh7905/Threads
cd Threads
```

## 2️⃣ Setup Frontend
```bash
npm install
```

Create .env.local file:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onBoarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_CLERK_WEBHOOK_SECRET=your_webhook_secret

GEMINI_API_KEY=your_gemini_api_key

NEXT_PUBLIC_MONGODB_URL=your_mongodb_url
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

UPLOADTHING_SECRET=your_uploadthing_secret_key
UPLOADTHING_APP_ID=your_uploadthing_id
```

Run frontend:
```bash
npm run dev
```

Frontend will run on:
```bash
http://localhost:3000
```

## 3️⃣ Setup Backend
```bash
cd backend
npm install
```

Create .env file in backend/:
```bash
PORT=8000
MONGO_URI=your_mongodb_connection_string
```

Start backend server:(use anyone of them)
```bash
npm run start
node index.js
nodemon index.js
```

Backend will run on:
```bash
http://localhost:8000
```


## 🚧 Future Improvements
- Likes & reactions
- Notifications
- Image uploads in threads
- Admin moderation panel

## 🤝 Contributing
Contributions are welcome!
Feel free to open an issue or submit a pull request.

## 👨‍💻 Author
Aditya Singh
GitHub: [@AdityaSingh7905](https://github.com/AdityaSingh7905)
