# Youtube Music Downloader • ![License](https://img.shields.io/badge/license-MIT-blue.svg)

This project is about downloading music (audio) from youtube. It also modifies file metadata, pasting custom artist and music title.

## Tech Stack

- [FastAPI](https://fastapi.tiangolo.com/) for the Python backend API.
  - PyJWT based authentication system.
  - [Pydantic](https://docs.pydantic.dev), used by FastAPI, for the data validation and settings management.
  - [SQLite](https://www.sqlite.org/) for the database.
  - [SqlAlchemy](https://www.sqlalchemy.org/) for ORM.
- [React](https://reactjs.org/) for the frontend.
  - [TypeScript](https://typescriptlang.org/) for type safety
  - [React Router 7](https://reactrouter.com/) for client-side routing
  - [Tailwind CSS](https://tailwindcss.com/) for styling.
  - [Shadcn](https://ui.shadcn.com/) for clean components.
  - [Lucide](https://lucide.dev/) for icons.
- [Docker Compose](https://docs.docker.com/compose/) for development
- [Traefik](https://traefik.io/traefik) as a reverse proxy to allow
  backend/frontend on the same port

## Quick Start

### Using Docker (Recommended)

1. Clone this repository

   ```
   git clone https://github.com/SyrymAbdikhan/yt-musik-dl.git
   cd yt-musik-dl
   ```

2. Copy and rename all `.env.example` files to `.env` and replace the required data.

   ```
   cp .env.example .env
   nano .env
   ```

3. Start the application with Docker:

   _For development or environment without a reverse proxy use `-f compose-dev.yml`_

   ```
   docker compose -f compose-dev.yml up -d --build
   ```

   This will:

   - Start SQLite database
   - Start the FastAPI backend at http://localhost:8000
   - Start the React frontend at http://localhost:3000

   The Swagger docs will be available at http://localhost:8000/docs

### Manual Setup (Alternative)

1. Backend Setup:

   a. Copy and rename `.env.example` file to `.env` and replace the required data.

   ```
   cd backend
   cp .env.example .env
   nano .env
   ```

   b. Install dependencies.

   ```
   pip install poetry
   poetry install
   ```

   c. Run the backend

   ```
   poetry run uvicorn app.main:app
   ```

2. Frontend Setup:

   a. Copy and rename `.env.example` file to `.env` and replace the required data.

   ```
   cd frontend
   cp .env.example .env
   nano .env
   ```

   b.

   ```
   npm install
   npm run dev
   ```

## Note

Running **locally** mostly does not require cookies to download the audio. But if it is running on a **production** server, youtube may require cookies to download the audio. For cookies extraction please refer to **[yt-dlp](https://github.com/yt-dlp/yt-dlp/wiki/Extractors)** page.

## Images

**Home page**
<img src="https://i.ibb.co.com/RpJ2kcp8/Home.png">

**Login page**
<img src="https://i.ibb.co.com/dsw6rdj4/Login.png">

**App page**
<img src="https://i.ibb.co.com/j9kTt6Fx/App.png">
