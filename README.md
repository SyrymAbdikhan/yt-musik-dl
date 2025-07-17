# Youtube Music DL • ![License](https://img.shields.io/badge/license-MIT-blue.svg)

This project is about downloading music (or audio) from youtube. It also
modifies file metadata, pasting custom artist and music title.

## Tech Stack

- **[FastAPI](https://fastapi.tiangolo.com/)** (Python 3.12.7)
  - JWT authentication using [OAuth2](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/) and PyJWT
- **[React](https://reactjs.org/)** (with Typescript)
- **[SQLite](https://www.sqlite.org/)** for the database
- **[SqlAlchemy](https://www.sqlalchemy.org/)** for ORM
- **[Docker Compose](https://docs.docker.com/compose/)** for development
- **[Traefik](https://traefik.io/traefik)** as a reverse proxy to allow
  backend/frontend on the same port
- **[Shadcn](https://ui.shadcn.com/)** for clean and beautiful components
  - **[Lucide](https://lucide.dev/)** for icons

## Prerequisites

- [Python 3.12](https://www.python.org/downloads/) or newer
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Docker](https://docs.docker.com/desktop/) (optional)

## Installation

Clone this repository

```
$ git clone https://github.com/SyrymAbdikhan/yt-musik-dl.git
$ cd yt-musik-dl
```

Copy and rename all `.env.example` files to `.env` and fill in the required data.

### Backend

Install the dependencies.

```
$ pip install poetry
$ poetry install
```

Run the backend

```
$ poetry run uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend

Install the dependencies.

```
$ npm install
```

Run the frontend (in dev mode)

```
$ npm run dev
```

will be available at [http://localhost:5173](http://localhost:5173)

or

```
$ npm run preview
```

will be available at [http://localhost:3000](http://localhost:3000). In this
case you should add this address in backend `.env` file as allow_origin.

### Docker

Optionally, you can run the application with Docker compose

```
$ docker compose up -d --build
```

Frontend will be available at specified doamin i.e. `example.com`.
And Backend will be available at `/api` route.

## Note

Running in **local** environment mostly does not require cookies to download
the audio. But if it is running on a **production** server, youtube may require
cookies to download the audio. For cookies extraction please refer to
**[yt-dlp](https://github.com/yt-dlp/yt-dlp/wiki/Extractors)** page.

## Images

**Login page**
<img src="https://i.imgur.com/sw8eWIl.jpeg">

**Download page**
<img src="https://i.imgur.com/F1dncIT.jpeg">
