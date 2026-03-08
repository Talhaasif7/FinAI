# 🤝 Contributing to FinAI

Thank you for your interest in contributing to FinAI! This guide covers everything you need to get started.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Conventions](#code-conventions)
- [Component Guidelines](#component-guidelines)
- [Styling Guidelines](#styling-guidelines)
- [Database & Backend](#database--backend)
- [Edge Functions](#edge-functions)
- [Testing](#testing)
- [Git Conventions](#git-conventions)
- [Pull Request Process](#pull-request-process)

---

## 📜 Code of Conduct

- Be respectful and inclusive in all interactions.
- Provide constructive feedback during code reviews.
- Report bugs and issues with clear reproduction steps.

---

## 🚀 Getting Started

### Prerequisites

| Tool       | Version  |
|------------|----------|
| Node.js    | ≥ 18.x   |
| Bun / npm  | Latest   |
| TypeScript | ≥ 5.x    |

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd finai

# Install dependencies
bun install   # or npm install

# Start development server
bun dev       # or npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔄 Development Workflow

1. **Pick an issue** or create one describing the feature/bug.
2. **Create a branch** from `main` using the naming convention below.
3. **Implement changes** following the code conventions.
4. **Write/update tests** if applicable.
5. **Run linting and tests** before committing.
6. **Open a Pull Request** with a clear description.

```bash
# Lint
bun lint

# Run tests
bun test

# Build check
bun run build
```

---

## 🏗 Code Conventions

### TypeScript

- **Strict mode** is enabled — avoid `any` types.
- Use **interfaces** for object shapes, **types** for unions/intersections.
- Prefer `const` over `let`; never use `var`.
- Use descriptive names — no single-letter variables outside loops.

```typescript
// ✅ Good
interface ExpenseFormData {
  merchant: string;
  amount: number;
  category: string;
}

const calculateTotal = (expenses: ExpenseFormData[]): number => {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
};

// ❌ Bad
const calc = (d: any) => d.reduce((s: any, e: any) => s + e.amount, 0);
```

### File Naming

| Type            | Convention            | Example                     |
|-----------------|-----------------------|-----------------------------|
| Pages           | PascalCase            | `Dashboard.tsx`             |
| Components      | PascalCase            | `HealthScoreWidget.tsx`     |
| Hooks           | camelCase, `use-` prefix | `use-mobile.tsx`         |
| Utilities       | kebab-case            | `mock-data.ts`              |
| Edge Functions  | kebab-case directory  | `behavioral-analysis/`      |

### Imports

Order imports in this sequence:

```typescript
// 1. React & framework
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 2. Third-party libraries
import { motion } from "framer-motion";
import { format } from "date-fns";

// 3. Internal components (use @ alias)
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 4. Hooks & utilities
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// 5. Types
import type { Tables } from "@/integrations/supabase/types";
```

### Path Aliases

Always use the `@/` alias for imports — never use relative paths like `../../`.

```typescript
// ✅ Good
import { Button } from "@/components/ui/button";

// ❌ Bad
import { Button } from "../../components/ui/button";
```

---

## 🧩 Component Guidelines

### Structure

```typescript
// 1. Imports
import { useState } from "react";
import { Card } from "@/components/ui/card";

// 2. Types/Interfaces
interface WidgetProps {
  title: string;
  value: number;
  className?: string;
}

// 3. Component
const Widget = ({ title, value, className }: WidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className={cn("p-4", className)}>
      <h3>{title}</h3>
      <p>{value}</p>
    </Card>
  );
};

export default Widget;
```

### Best Practices

- **One component per file** — keep components focused and small.
- **Props over context** for data that flows 1–2 levels.
- Use **React Query** (`@tanstack/react-query`) for all server state.
- Use **react-hook-form + zod** for form validation.
- Wrap animations with **framer-motion** `motion` components.
- Use **shadcn/ui** components as the base — avoid building from scratch.

### Component Size

If a component exceeds ~150 lines, consider splitting it into smaller sub-components in the same directory or extracting logic into a custom hook.

---

## 🎨 Styling Guidelines

### Design Tokens (Critical)

**Never use raw color values in components.** Always reference semantic tokens from the design system.

```tsx
// ✅ Good — semantic tokens
<div className="bg-background text-foreground border-border" />
<div className="bg-primary text-primary-foreground" />
<div className="bg-muted text-muted-foreground" />
<div className="text-accent-foreground bg-accent" />

// ❌ Bad — raw colors
<div className="bg-white text-black border-gray-200" />
<div className="bg-emerald-500 text-white" />
```

### Available Tokens

| Token           | Usage                          |
|-----------------|--------------------------------|
| `background`    | Page/card backgrounds          |
| `foreground`    | Primary text                   |
| `primary`       | CTAs, active states            |
| `secondary`     | Secondary actions              |
| `muted`         | Subtle backgrounds, disabled   |
| `accent`        | Highlights, badges             |
| `destructive`   | Errors, delete actions         |
| `border`        | Borders, dividers              |
| `card`          | Card surfaces                  |
| `sidebar`       | Sidebar-specific tokens        |

### Tailwind Classes

- Use **Tailwind utility classes** — avoid inline styles.
- Use `cn()` from `@/lib/utils` to merge conditional classes.
- Responsive design: mobile-first (`sm:`, `md:`, `lg:`).
- Dark mode is handled automatically via CSS variables.

```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "rounded-xl p-4 transition-all",
  isActive && "ring-2 ring-primary",
  className
)} />
```

### Animations

Use framer-motion with consistent patterns:

```tsx
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};
```

---

## 🗄 Database & Backend

### Supabase Client

```typescript
import { supabase } from "@/integrations/supabase/client";
```

**Never edit these auto-generated files:**
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `supabase/config.toml`
- `.env`

### Row-Level Security (RLS)

- **All tables must have RLS enabled.**
- Use `auth.uid()` to scope data to the authenticated user.
- Use security definer functions for role checks to avoid recursive policies.
- Test policies thoroughly — both allowed and denied scenarios.

### Schema Changes

- All schema changes go through migration files in `supabase/migrations/`.
- Never modify `auth.*` or `storage.*` schemas directly.
- Always consider nullable columns and default values.

---

## ⚡ Edge Functions

Edge functions live in `supabase/functions/<function-name>/index.ts`.

### Template

```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Your logic here

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

### Conventions

- Always handle CORS preflight (`OPTIONS`) requests.
- Authenticate users via the `Authorization` header.
- Return consistent JSON responses with proper status codes.
- Use environment variables for secrets — never hardcode.

---

## 🧪 Testing

### Stack

- **Vitest** — test runner
- **Testing Library** — React component testing
- **jsdom** — DOM environment

### Running Tests

```bash
bun test          # Single run
bun test:watch    # Watch mode
```

### Writing Tests

```typescript
import { describe, it, expect } from "vitest";

describe("calculateTotal", () => {
  it("should sum all expense amounts", () => {
    const expenses = [
      { amount: 100 },
      { amount: 250 },
    ];
    expect(calculateTotal(expenses)).toBe(350);
  });
});
```

### What to Test

- Utility functions and business logic
- Component rendering and user interactions
- Form validation rules
- Edge cases and error states

---

## 📝 Git Conventions

### Branch Naming

```
feat/short-description     # New feature
fix/short-description      # Bug fix
refactor/short-description # Code refactor
docs/short-description     # Documentation
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add behavioral spending analysis page
fix: resolve health score calculation for zero expenses
refactor: extract chart config into shared utility
docs: update README with edge function documentation
style: align dashboard grid spacing on mobile
```

### Commit Scope (optional)

```
feat(dashboard): add health score widget
fix(auth): handle expired session redirect
```

---

## 🔀 Pull Request Process

1. **Title** follows the commit message convention.
2. **Description** includes:
   - What changed and why
   - Screenshots for UI changes
   - Breaking changes (if any)
3. **Checklist:**
   - [ ] Code follows the style guidelines
   - [ ] Semantic design tokens used (no raw colors)
   - [ ] RLS policies reviewed for new/modified tables
   - [ ] Tests added/updated
   - [ ] `bun lint` passes
   - [ ] `bun run build` succeeds
4. **Review** — at least one approval required before merging.

---

## 📂 Project Structure Reference

```
src/
├── components/          # Reusable UI components
│   └── ui/              # shadcn/ui base components
├── hooks/               # Custom React hooks
├── integrations/        # Supabase client & types (auto-generated)
├── lib/                 # Utilities & mock data
├── pages/               # Route-level page components
└── assets/              # Static assets (images, fonts)

supabase/
├── functions/           # Edge Functions (Deno)
├── migrations/          # Database migrations (SQL)
└── config.toml          # Supabase config (auto-managed)
```

---

## ❓ Questions?

If you're unsure about anything, open an issue or start a discussion. We're happy to help!
