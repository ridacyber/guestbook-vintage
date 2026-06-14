Guestbook

A full-stack guestbook web app with a vintage, handwritten-note aesthetic. Visitors can leave a name and a message, which are stored in a real PostgreSQL database. Each message gets a unique deletion token so authors can remove their own posts, while an admin password grants full moderation access.

Live: guestbook-vintage.vercel.app

Tech Stack


Frontend: React (Vite), custom CSS
Backend: Node.js, Express
Database: PostgreSQL
Deployment: Vercel (frontend), Render (backend + database)


Features


Leave a note with a name and message
Messages persist in a PostgreSQL database — no mock data or local storage
Delete your own message via a unique deletion token
Admin password unlocks full moderation (delete any message)
Privacy policy modal built into the UI


Project Structure

guestbook-vintage/
├── client/      # React frontend (Vite)
└── server/      # Express backend + PostgreSQL connection

License

This project is closed source. All rights reserved. The code is not licensed for use, modification, or distribution.

Author

Built by Rida at TawakalStudio.

Questions or feedback: info@tawakalstudio.com
