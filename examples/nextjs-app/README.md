# Example Next.js App

This is a demo application used to showcase the NaturalLink Regression Check
action.

## How to Use

### Trigger a Regression Check

1. Create a branch from `main`
2. Make changes to any file in this directory
3. Open a pull request
4. The regression check will automatically run

### Example Changes to Try

**Change the hero text:**

```tsx
// src/components/Hero.tsx
<h1>Build Better Software</h1>
// Change to:
<h1>Ship With Confidence</h1>
```

**Modify the color scheme:**

```css
/* src/app/globals.css */
--primary: #7c3aed;
/* Change to: */
--primary: #2563eb;
```

**Add a new feature card:**

```tsx
// src/components/Features.tsx
// Add to the features array:
{
  title: 'New Feature',
  description: 'Your new feature description here.'
}
```

## Local Development

```bash
cd examples/nextjs-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.
