# TaskFlow

A Trello-style task board: sign up, create boards, add columns, add tasks,
and drag tasks between columns. Built as a real full-stack app:

```
taskflow/
├── backend/          Node.js + Express REST API, SQLite database
│   ├── server.js      entry point
│   ├── db.js          database connection + schema
│   ├── middleware/     login-check logic
│   └── routes/         one file per resource (auth, boards, columns, tasks)
└── frontend/         React app (Vite), talks to the backend over HTTP
    └── src/
        ├── pages/       Login, Register, Dashboard, Board
        ├── components/  Column, TaskCard
        ├── context/      shared login state
        └── api.js        all calls to the backend live here
```

## How the pieces fit together

1. **Frontend** (React, running on `localhost:5173`) is just the UI. It has
   no data of its own - every board/column/task you see was fetched from
   the backend.
2. **Backend** (Express, running on `localhost:4000`) is the API. It's the
   only thing allowed to talk to the database. It checks logins, and makes
   sure one user can never see or edit another user's boards.
3. **Database** (SQLite, a single file: `backend/taskflow.db`) is where
   everything is actually stored. It's created automatically the first
   time you start the backend.

This split (frontend / backend / database) is the standard shape of most
real web applications you use every day.

## Running it locally

You'll need [Node.js](https://nodejs.org) installed (v18 or later). Check with:

```bash
node --version
```

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set `JWT_SECRET` to any long random string (this is what
signs login tokens - keep it secret and never commit it).

```bash
npm start
```

You should see `TaskFlow API running at http://localhost:4000`. Leave this
terminal running.

### 2. Frontend

Open a **new** terminal tab (keep the backend running):

```bash
cd frontend
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). Register an
account and start creating boards.

> Note: this app keeps you logged in only in memory (no browser storage),
> so refreshing the page will log you out during local dev. That's a
> deliberate, simple starting point - see "Ideas for what to build next"
> below for how to make login persist.

## Using Git properly (since that's part of the point)

If you haven't already, initialize a repo and make your first commit:

```bash
cd taskflow
git init
git add .
git commit -m "Initial commit: TaskFlow full-stack app"
```

From here on, a good habit real developers use:

```bash
git checkout -b add-due-dates      # create a branch for a new feature
# ...make changes...
git add .
git commit -m "Add due dates to tasks"
git checkout main
git merge add-due-dates            # bring the feature back into main
```

Push to GitHub (create an empty repo on github.com first, then):

```bash
git remote add origin https://github.com/<your-username>/taskflow.git
git branch -M main
git push -u origin main
```

Your `.env` and `taskflow.db` are already excluded via `.gitignore` -
secrets and local data should never be committed.

## Deploying it live (optional, when you're ready)

- **Backend**: [Render](https://render.com) or [Railway](https://railway.app)
  both have free tiers and deploy straight from a GitHub repo. Set the
  `JWT_SECRET` environment variable in their dashboard (not in a committed
  file). SQLite works but on most free hosting the disk resets on redeploy -
  once you're ready for something permanent, swapping `better-sqlite3` for
  a hosted Postgres database (e.g. [Neon](https://neon.tech), free tier) is
  the natural next step.
- **Frontend**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com) -
  connect your repo, set the build command to `npm run build`, and set
  `VITE_API_URL` to your deployed backend's URL.

Ask me when you're ready to actually do this step - I can walk you through
whichever host you pick.

## Ideas for what to build next

Once this feels comfortable, here are natural next features (each is a
good "next commit"):

- **Persist login** across page refreshes using `localStorage`
- **Task due dates** and color-coded labels/priority
- **Editing** a task's title/description after creation (currently only
  create/delete/move are wired up)
- **Reordering columns** themselves via drag-and-drop
- **Comments** on tasks
- **Search/filter** tasks across a board
- **Tests** - Jest for the backend routes is a great first testing project

Whenever you want to add one of these, just tell me which one and I'll
help you build it the same way.
