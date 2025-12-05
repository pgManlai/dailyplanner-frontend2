# PlanFlow Frontend

Modern task management and productivity web application built with React, TypeScript, and Vite.

## Features

- 📋 **Task Management**: Create, update, and organize tasks with priorities and categories
  - 🖱️ **Drag & Drop Kanban**: Move tasks between columns with mouse (To Do → In Progress → Done)
  - 📄 **Pagination**: View tasks in pages (10 per page) for better performance
  - ⏰ **Expired Tasks**: Automatic detection and separate column for overdue tasks
  - 🔍 **Filters**: Filter by All, Today, Upcoming, Completed
  - 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 📅 **Calendar View**: Visual calendar with task scheduling
  - 📆 **Daily View**: See all tasks for selected date
  - 🔗 **Task Navigation**: Click tasks to navigate to detail page
  - 📊 **Task Count**: See number of tasks per day on calendar
- 🎯 **Goal Tracking**: Set and track goals with checklist items
  - ✅ **Checklist Support**: Break down goals into actionable items
  - 📊 **Progress Tracking**: Visual progress bars and completion status
  - 🎯 **Detail View**: Click goals to see detailed information
- 🤖 **AI Assistant**: Mongolian-speaking chatbot for productivity advice
  - 💬 **Conversation Memory**: AI remembers previous messages in the conversation
  - 📝 **Context-Aware**: Accesses your tasks and goals for personalized advice
  - 🌐 **Mongolian Language**: Primary language is Mongolian
- ⏱️ **Focus Mode**: Pomodoro-style focus timer with customizable durations
  - ⏲️ **Custom Durations**: Set your own work and break times (1-120 minutes)
  - 📳 **Vibration**: Phone vibrates when timer completes (mobile browsers)
  - 🔊 **Audio Alert**: Beep sound when timer ends
  - 🔔 **Browser Notifications**: Desktop notifications when focus session ends
- 🔔 **Notifications**: Real-time notifications for tasks and reminders
  - 📧 **Email Notifications**: Gmail alerts for due tasks and completions
  - 🌐 **Web Notifications**: Browser push notifications
  - ⚡ **Real-time Updates**: Socket.IO for instant notifications
- 📊 **Dashboard**: Overview of tasks, goals, and productivity stats
  - 📈 **Task Statistics**: Today's tasks, completion rate
  - 🎯 **Goal Progress**: Visual progress bars for goals
- 🌐 **Mongolian Language**: Full UI translation to Mongolian
  - 🇲🇳 **Complete Translation**: All text, buttons, labels in Mongolian
  - 📝 **Date Formatting**: Dates displayed in Mongolian format

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Animations**: Framer Motion
- **Drag & Drop**: @dnd-kit (core, sortable, utilities)
- **HTTP Client**: Axios

## Prerequisites

- Node.js (v18 or higher)
- Backend server running (see backend README)

## Installation

### Step 1: Clone the repository
```bash
git clone <your-repo-url>
cd v4/PlanFlow
```

### Step 2: Install Node.js dependencies

**⚠️ ЧУХАЛ: Энэ алхмыг заавал хийх шаардлагатай!**

Бүх шаардлагатай сангуудыг суулгах:
```bash
npm install
```

Энэ нь дараах сангуудыг суулгана:
- `react` & `react-dom` - UI framework
- `typescript` - Type safety
- `vite` - Build tool
- `tailwindcss` - Styling
- `wouter` - Routing
- `axios` - HTTP client
- `date-fns` - Date utilities
- `framer-motion` - Animations
- `lucide-react` - Icons
- `shadcn/ui` components - UI library

**Хэрэв алдаа гарвал:**
```bash
# Node modules устгаад дахин оролдох
rm -rf node_modules package-lock.json
npm install

# Эсвэл yarn ашиглах
yarn install

# Эсвэл pnpm ашиглах
pnpm install
```

### Step 3: Backend холбох

**⚠️ Backend server эхлээд ажиллаж байх ёстой!**

Backend-ийг эхлүүлэх (өөр terminal дээр):
```bash
cd ../v4-backend
node server.js
```

Frontend нь автоматаар `http://localhost:8000/api` руу холбогдоно.

### Step 4: Start the development server

```bash
npm run dev
```

✅ Амжилттай ажиллавал: **`serving on port 3000`**

Browser автоматаар нээгдэнэ, эсвэл гараар: **`http://localhost:3000`**

## Available Scripts

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## Common Issues / Түгээмэл асуудал

### 1. `npm install` алдаа
```bash
# Node.js хувилбар шалгах (18+ байх ёстой)
node --version

# npm cache цэвэрлэх
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 2. Port 3000 ашиглагдаж байна
```bash
# Windows: Port хэрэглэж байгаа process-ийг олох
netstat -ano | findstr :3000
taskkill /PID <process-id> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Эсвэл өөр port ашиглах
npm run dev -- --port 3001
```

### 3. Backend холбогдохгүй байна
- Backend server ажиллаж байгаа эсэхийг шалгах: `http://localhost:8000`
- Browser console дээр network errors шалгах
- CORS алдаа байвал backend дээр CORS тохируулгыг шалгах

### 4. White screen / blank page
```bash
# Build folder цэвэрлэх
rm -rf dist
npm run build
npm run preview

# Browser cache цэвэрлэх
# Chrome: Ctrl+Shift+Delete
# Hard refresh: Ctrl+Shift+R
```

### 5. TypeScript алдаанууд
```bash
# Type checking ажиллуулах
npm run type-check

# Автоматаар засах боломжтой алдаанууд
npm run lint -- --fix
```

### 6. Styling харагдахгүй байна
```bash
# Tailwind CSS rebuild хийх
npm run dev

# node_modules дахин суулгах
rm -rf node_modules package-lock.json
npm install
```

## First Time Setup Checklist

Backend эхлүүлэхийн өмнө:
- [ ] PostgreSQL суулгасан
- [ ] Backend dependencies суулгасан (`npm install`)
- [ ] `.env` файл үүсгэж тохируулсан
- [ ] Database migration хийсэн (`npx prisma migrate dev`)
- [ ] Backend server ажиллаж байгаа (`node server.js`)

Frontend эхлүүлэхийн өмнө:
- [ ] Frontend dependencies суулгасан (`npm install`)
- [ ] Backend server ажиллаж байгаа
- [ ] Port 3000 чөлөөтэй байгаа

Бүгд бэлэн бол:
```bash
npm run dev
```

Browser дээр `http://localhost:3000` нээгдэнэ! 🎉

## Project Structure

```
PlanFlow/
├── client/
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/          # Page components
│       ├── lib/            # Utilities and helpers
│       ├── hooks/          # Custom React hooks
│       └── App.tsx         # Main app component
├── server/                 # Development server setup
└── public/                 # Static assets
```

## Key Pages

- `/` - Dashboard (task overview, goals, quick stats)
- `/tasks` - Task management page
- `/calendar` - Calendar view with task scheduling
- `/chatbot` - AI assistant chat interface
- `/notifications` - Notification center
- `/login` & `/register` - Authentication pages

## Features in Detail

### Task Management
- Create tasks with title, description, priority, category, and due date
- Filter tasks by status (To Do, In Progress, Done)
- Search tasks by title
- Edit and delete tasks
- Mark tasks as complete

### Goal Tracking
- Create goals with target values or checklist items
- Track progress automatically
- View detailed goal information with checklists
- Mark goals complete when all items are done

### AI Chatbot
- Ask questions in Mongolian or English
- Get advice on task planning and productivity
- Context-aware responses based on your tasks and goals
- Clear chat history option

### Focus Mode
- Customizable work and break durations
- Visual countdown timer
- Audio and browser notifications when timer completes
- Helps implement Pomodoro technique

### Calendar
- Visual monthly calendar
- View tasks scheduled for each day
- Click on dates to see task details
- Click on tasks to navigate to task page

## UI Components

Built with shadcn/ui components:
- Button, Input, Select, Textarea
- Dialog, Sheet, Popover
- Card, Badge, Avatar
- Calendar, Progress
- Toast notifications
- Skeleton loaders

## API Integration

Frontend connects to backend API at `http://localhost:8000/api`:
- Authentication with JWT cookies
- Automatic token refresh
- Error handling with toast notifications
- 401 redirect to login

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari

## License

MIT

#   G i r l c o d e  
 #   d a i l y p l a n n e r - f r o n t e n d 2  
 