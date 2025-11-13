# Frontend Tech Stack Documentation

## 🎯 Complete Technology Stack

### Core Framework
- **React 18.3.1** with TypeScript 5.8.3
- **Vite 5.4.19** - Lightning-fast build tool
- **React Router v6.30.1** - Client-side routing

### State Management
- **Redux Toolkit (@reduxjs/toolkit)** - Modern Redux with less boilerplate
- **RTK Query** - Powerful data fetching and caching
- **React Redux** - React bindings for Redux

### UI Framework & Styling
- **Radix UI** - Headless UI component library
- **shadcn/ui** - Beautiful, accessible components built on Radix
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Tailwind CSS Animate** - Animation utilities
- **Lucide React** - Beautiful icon library

### Forms & Validation
- **React Hook Form 7.61.1** - Performant form management
- **Zod 3.25.76** - TypeScript-first schema validation (better than Yup)
- **@hookform/resolvers** - Form validation resolvers

### Charts & Data Visualization
- **Recharts 2.15.4** - React charting library built on D3

### Real-time Communication
- **Socket.io Client** - WebSocket-based real-time communication

### File Management
- **React Dropzone** - Drag-and-drop file uploads

### Additional Libraries
- **@tanstack/react-query** - Async state management (alternative/complement to RTK Query)
- **date-fns** - Modern date utility library
- **clsx** & **tailwind-merge** - Utility for conditional className merging
- **class-variance-authority** - Type-safe variant styling

## 📁 Project Structure

\`\`\`
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── charts/         # Chart components
│   ├── FileUpload.tsx  # File upload component
│   └── ExampleFeatures.tsx  # Tech demo component
├── store/              # Redux store
│   ├── index.ts        # Store configuration
│   ├── api.ts          # RTK Query API
│   ├── hooks.ts        # Typed Redux hooks
│   └── slices/         # Redux slices
│       ├── authSlice.ts
│       ├── conversationSlice.ts
│       └── goalSlice.ts
├── hooks/              # Custom React hooks
│   ├── use-socket.tsx  # Socket.io hook
│   └── use-toast.ts    # Toast notifications
├── lib/                # Utility libraries
│   ├── api.ts          # API client
│   ├── socket.ts       # Socket.io service
│   └── utils.ts        # Utility functions
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   └── Register.tsx
└── main.tsx            # App entry point with Redux Provider
\`\`\`

## 🚀 Getting Started

### Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Run Development Server

\`\`\`bash
# Frontend only
npm run dev

# Frontend + Backend
npm run dev:full
\`\`\`

### Build for Production

\`\`\`bash
npm run build
\`\`\`

## 📦 Key Features Implemented

### 1. Redux Toolkit Store
Located in \`src/store/\`:
- Configured store with RTK Query
- Auth, Conversation, and Goal slices
- TypeScript support with typed hooks

### 2. RTK Query API
Located in \`src/store/api.ts\`:
- Automatic caching and invalidation
- Optimistic updates
- Generated hooks for all endpoints

### 3. Socket.io Integration
Located in \`src/lib/socket.ts\` and \`src/hooks/use-socket.tsx\`:
- Singleton socket service
- React hook for easy usage
- Auto-reconnection
- Event-based communication

### 4. File Upload Component
Located in \`src/components/FileUpload.tsx\`:
- Drag-and-drop support
- Multiple file uploads
- File size validation
- Progress tracking
- File type restrictions

### 5. Form Management
Using React Hook Form + Zod:
- Type-safe validation
- Minimal re-renders
- Easy integration with UI components

## 📝 Usage Examples

### Using Redux with TypeScript

\`\`\`typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, logout } from '@/store/slices/authSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogin = (user, token) => {
    dispatch(setCredentials({ user, token }));
  };

  return <div>{user?.name}</div>;
}
\`\`\`

### Using RTK Query

\`\`\`typescript
import { useGetConversationsQuery, useCreateConversationMutation } from '@/store/api';

function Conversations() {
  const { data, isLoading, error } = useGetConversationsQuery();
  const [createConversation, { isLoading: isCreating }] = useCreateConversationMutation();

  const handleCreate = async () => {
    await createConversation({ title: 'New Conversation' });
  };

  return <div>{/* Your UI */}</div>;
}
\`\`\`

### Using Socket.io

\`\`\`typescript
import { useSocket } from '@/hooks/use-socket';

function Chat() {
  const { isConnected, emit, on, off } = useSocket(token);

  useEffect(() => {
    const handleMessage = (message) => {
      console.log('Received:', message);
    };

    on('message', handleMessage);
    return () => off('message', handleMessage);
  }, [on, off]);

  const sendMessage = () => {
    emit('sendMessage', { text: 'Hello!' });
  };

  return <div>{isConnected ? 'Connected' : 'Disconnected'}</div>;
}
\`\`\`

### Using File Upload

\`\`\`typescript
import { FileUpload } from '@/components/FileUpload';

function MyForm() {
  const handleUpload = (files: File[]) => {
    console.log('Uploaded:', files);
    // Process files
  };

  return (
    <FileUpload
      onUpload={handleUpload}
      maxFiles={5}
      maxSize={10 * 1024 * 1024} // 10MB
      accept={{
        'image/*': ['.png', '.jpg', '.jpeg'],
        'application/pdf': ['.pdf'],
      }}
    />
  );
}
\`\`\`

### Using React Hook Form with Zod

\`\`\`typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function LoginForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* Form fields */}</form>;
}
\`\`\`

## 🔧 Configuration Files

- **vite.config.ts** - Vite configuration
- **tsconfig.json** - TypeScript configuration
- **tailwind.config.ts** - Tailwind CSS configuration
- **components.json** - shadcn/ui configuration
- **.env** - Environment variables

## 🌐 Environment Variables

Create a \`.env\` file in the root:

\`\`\`env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
\`\`\`

## 📚 Resources

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
- [React Router Docs](https://reactrouter.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [Recharts Docs](https://recharts.org/)
- [Socket.io Client Docs](https://socket.io/docs/v4/client-api/)
- [React Dropzone Docs](https://react-dropzone.js.org/)

## 🎨 Component Library

The project uses **shadcn/ui** which provides:
- Pre-built, customizable components
- Accessible by default (ARIA compliant)
- Built on Radix UI primitives
- Fully typed with TypeScript
- Easy to customize with Tailwind CSS

Available components in \`src/components/ui/\`:
- Button, Card, Dialog, Dropdown, Form
- Input, Select, Checkbox, Radio, Switch
- Table, Tabs, Toast, Tooltip
- And many more...

## 🚀 Next Steps

1. ✅ All dependencies installed
2. ✅ Redux store configured
3. ✅ Socket.io setup complete
4. ✅ File upload component created
5. ✅ Example component created

**You're ready to build!** Check out \`ExampleFeatures.tsx\` for usage examples.
