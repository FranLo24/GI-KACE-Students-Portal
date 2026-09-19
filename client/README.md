# GI-KACE Students Registration Portal

Students apply for GI-KACE ICT programmes through a registration form. Admins review applicants, shortlist them (which creates their invoice on the GI-KACE e-invoice site), and track whether each invoice has been paid.

This guide explains how to put the portal on the internet. It assumes you have never deployed a website before.

---

## How the project fits together

The project has three parts that run together:

| Part | Folder | What it is |
|---|---|---|
| **Website** | `client/` | The registration form and admin dashboard (React). It gets compiled into plain HTML, CSS and JavaScript files. |
| **Server** | `server/` | A Node.js program that stores registrations, handles admin logins and talks to the invoice site. It runs non-stop on port 5000. |
| **Database** | — | MySQL. Stores students, courses and settings. Only the server talks to it. |

A fourth program, **nginx**, sits in front of everything so visitors see a single website. It serves the website's files, and passes any address starting with `/api` or `/uploads` on to the server.

The website and server **must share one address**. The website asks for data at `/api/...`, meaning "the same site I was loaded from". The nginx setup below takes care of this.

---

## Before you start

### Your computer vs. the server

You write the code on your own computer. The live site runs on a **different computer**: a Linux server you rent, which stays on all the time.

**Every command in this guide runs on that server, not on your PC.** If you type `sudo apt update` into PowerShell on Windows, you'll get "command not found". That's expected, because those are Linux commands. Connect to the server first (Step 1).

### What you need

- **A Linux server running Ubuntu 24.04.** Rent one from DigitalOcean, Hetzner, Contabo or similar (about $5/month). You'll get an **IP address** and a **root password**.
- **A domain name** (e.g. `register.gikace.org`) with a DNS "A record" pointing at the server's IP address.
- **Your latest code pushed to GitHub**, on the branch you want to deploy. If your changes are on a branch other than `master`, merge them into `master` first, or clone that branch in Step 4.
- **An e-invoice API key** from the GI-KACE invoice team.

---

## Step 1 — Connect to your server

On Windows, open PowerShell. On Mac/Linux, open Terminal. Then run:

```bash
ssh root@YOUR_SERVER_IP
```

- The first time, it asks `Are you sure you want to continue connecting?` Type `yes`.
- Type the root password. **Nothing appears on screen as you type.** That's normal; press Enter when done.

Your prompt changes to something like `root@ubuntu:~#`. You're now typing on the server. Type `exit` to get back to your own computer.

---

## Step 2 — Install the software

```bash
sudo apt update
sudo apt install -y curl git nginx mysql-server

# Node.js 22. Ubuntu's own "nodejs" package is too old for this project.
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# pm2 keeps the server running, and restarts it after crashes and reboots.
sudo npm install -g pm2

node -v    # should print v22.something
```

> **Why not `apt install nodejs`?** It installs Node 18, and the website build needs Node 20.19 or newer. The build fails with a version error if you use it.

---

## Step 3 — Create the database

```bash
sudo mysql
```

You're now inside MySQL. Paste this, choosing your own password:

```sql
CREATE DATABASE student_portal;
CREATE USER 'portal'@'localhost' IDENTIFIED BY 'CHOOSE-A-STRONG-PASSWORD';
GRANT ALL PRIVILEGES ON student_portal.* TO 'portal'@'localhost';
EXIT;
```

This creates an empty database and a user that's allowed to use it. The tables get created in Step 6.

---

## Step 4 — Download the code

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/FranLo24/GI-KACE-Students-Portal.git portal
```

- **To deploy a branch other than `master`,** add `-b branch-name` after `clone`.
- **If the repository is private,** GitHub asks for a username and password. Use a [personal access token](https://github.com/settings/tokens) as the password; your normal GitHub password won't work.

> Put the code in `/var/www`, not your home folder. nginx isn't allowed to read files inside `/root`, and the site shows "403 Forbidden" if you put it there.

---

## Step 5 — Configure the server

The server reads its passwords and keys from a file called `.env`. **This file is not on GitHub on purpose**, since it holds secrets, so you create it on the server by hand:

```bash
cd /var/www/portal/server
nano .env
```

Paste the following, replacing each value:

```
DATABASE_URL="mysql://portal:CHOOSE-A-STRONG-PASSWORD@localhost:3306/student_portal"
JWT_SECRET=paste-a-long-random-string-here
PORT=5000

INVOICE_API_KEY=your-invoice-api-key
INVOICE_API_BASE_URL=https://api.einvoice.gikace.org
INVOICE_SYNC_INTERVAL_MINUTES=30
```

Save with **Ctrl+O**, press **Enter**, then exit with **Ctrl+X**.

| Variable | Required? | What it's for |
|---|---|---|
| `DATABASE_URL` | Yes | How to reach MySQL. Use the password from Step 3. |
| `JWT_SECRET` | Yes | Proves an admin is logged in. **Make a new one for the live site.** Run `openssl rand -hex 32` to generate one. |
| `PORT` | No (default `5000`) | The port the server listens on. It must match the nginx config in Step 10. |
| `INVOICE_API_KEY` | Yes | Lets the portal fetch courses and create invoices on the e-invoice site. |
| `INVOICE_API_BASE_URL` | No (default shown) | Address of the e-invoice API. |
| `INVOICE_SYNC_INTERVAL_MINUTES` | No (default `30`) | How often courses are re-synced from the invoice site. |
| `SMTP_*`, `ARKESEL_*` | No | Email and SMS settings. The portal doesn't currently send email or SMS, so you can leave these out. |

> Your development `.env` may also contain `INVOICE_PRODUCTS_API_URL`. Nothing reads it any more, so you can leave it out.

---

## Step 6 — Set up the database tables

```bash
cd /var/www/portal/server
npm ci
npx prisma generate
npx prisma migrate deploy
node prisma/seedFormConfig.js
```

What each command does:

- **`npm ci`** installs the server's libraries.
- **`prisma generate`** prepares the code that talks to the database.
- **`prisma migrate deploy`** creates all the tables. It only adds what's missing and never deletes data, so it's safe to run again later.
- **`seedFormConfig.js`** fills in the registration form's questions. **Skip this and the registration page is blank**, because the form's questions are stored in the database, not in the code. Running it again is harmless; it never overwrites changes made in Settings.

> ⚠️ **Do not run `prisma/seed.js`.** It adds fake demo students, which is fine on a laptop but not on the live site.

---

## Step 7 — Create the admin account

There is no sign-up page for admins, so create the first one from the command line. Replace the username and password in the last line:

```bash
cd /var/www/portal/server
cat > create-admin.js <<'EOF'
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const [username, password] = process.argv.slice(2);
prisma.admin
  .create({ data: { username, passwordHash: bcrypt.hashSync(password, 10) } })
  .then(() => console.log(`Admin "${username}" created.`))
  .catch((error) => console.error('Could not create admin:', error.message))
  .finally(() => prisma.$disconnect());
EOF
node create-admin.js admin 'CHOOSE-AN-ADMIN-PASSWORD'
rm create-admin.js
```

The password is scrambled ("hashed") before it's stored. That's why you can't type it straight into the database.

---

## Step 8 — Start the server

```bash
cd /var/www/portal/server
pm2 start server.js --name portal-api
pm2 save
pm2 startup
```

`pm2 startup` prints one more command starting with `sudo env PATH=...`. **Copy and run that command.** It makes the server start automatically when the machine reboots.

Check it's running:

```bash
pm2 logs portal-api --lines 20
```

You should see `Server running on port 5000`. Press **Ctrl+C** to stop watching the logs; the server keeps running.

On startup the server also syncs the course catalogue from the invoice site. Check that the logs show no `sync failed` errors.

---

## Step 9 — Build the website

```bash
cd /var/www/portal/client
npm ci
npm run build
```

This creates a `dist` folder of finished files for nginx to serve.

> `npm run dev` is only for working on your own computer. Never use it on the live site.

---

## Step 10 — Set up nginx

Create a config file for the site:

```bash
sudo nano /etc/nginx/sites-available/portal
```

Paste this, replacing `your-domain.com`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Allows hero images up to the server's 5 MB limit (nginx's default is 1 MB).
    client_max_body_size 5M;

    root /var/www/portal/client/dist;
    index index.html;

    # Addresses like /register and /admin/login aren't real files, so hand them
    # to the website and let it show the right page.
    location / {
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads {
        proxy_pass http://127.0.0.1:5000;
    }
}
```

Turn it on and switch off nginx's default page:

```bash
sudo ln -s /etc/nginx/sites-available/portal /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t                  # checks for typos; should say "syntax is ok"
sudo systemctl reload nginx
```

Visiting `http://your-domain.com` should now show the registration page.

---

## Step 11 — Turn on HTTPS

HTTPS encrypts traffic so admin passwords aren't sent in the clear. It's free:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Follow the prompts. Certbot updates the nginx config for you and renews the certificate automatically.

---

## Step 12 — First-time admin setup

A fresh database has no custom settings, so finish setting up in the admin dashboard at `https://your-domain.com/admin/login`.

1. **Set a level for every course.** Go to **Course Recommendations** and give each course a level (Beginner, Intermediate or Advanced).
   > ⚠️ **This step is required.** The registration form only shows courses whose level matches the applicant's computer literacy level. **A course with no level never appears**, so until levels are set, applicants can't choose a course at all.
2. **Check the courses synced.** In **Settings**, the Courses panel should list the courses from the invoice site. If it's empty, click **Sync from Invoice**.
3. **Re-create any custom form fields.** The seed in Step 6 creates the standard form only. Fields you added through Settings on your own computer (for example *Last Name*, *Sponsor* or *Date of Birth*) aren't copied, so add them again in **Settings**.
4. **Upload the hero image** and adjust fonts in **Settings → Appearance**, if you use them.

---

## Check that it all works

Go through these in order. The first one that fails tells you where to look.

1. `https://your-domain.com` shows the registration page **with its questions**.
2. `https://your-domain.com/api/courses` shows a block of course data (text, not a web page).
3. You can log in at `/admin/login` and see the **Students** page.
4. On the registration form, choosing a computer literacy level shows course cards.

---

## Updating the live site later

When you've pushed new changes to GitHub, connect to the server and run:

```bash
cd /var/www/portal
git pull

cd server
npm ci
npx prisma generate
npx prisma migrate deploy
pm2 restart portal-api

cd ../client
npm ci
npm run build
```

Run `migrate deploy` **before** restarting, so the database is ready for the new code.

---

## Troubleshooting

| What you see | Likely cause | Fix |
|---|---|---|
| `sudo` / `apt`: command not found | You're typing on your own PC, not the server | Connect with `ssh` first (Step 1) |
| Registration page shows no questions | The form seed wasn't run | Run `node prisma/seedFormConfig.js` in `server/` |
| Form shows no courses for any level | Course levels aren't set | Admin → **Course Recommendations** (Step 12) |
| **502 Bad Gateway** | The server isn't running | `pm2 status`, then `pm2 logs portal-api` to see the error |
| **404** when refreshing on `/register` | `try_files` line missing from nginx config | Check Step 10, then `sudo systemctl reload nginx` |
| **403 Forbidden** | Code is in a folder nginx can't read | Keep the code in `/var/www` (Step 4) |
| **413** when uploading an image | nginx upload limit too low | Add `client_max_body_size 5M;` (Step 10) |
| Build fails mentioning a Node version | Node is too old | Install Node 22 as in Step 2 |
| Everyone got logged out | `JWT_SECRET` changed | Expected; log in again |

---

## Good to know

- **Uploaded images are ordinary files** in `/var/www/portal/server/uploads`. Keep that folder when updating, and include it in backups. Hosting services that wipe the disk on every deploy (Heroku, Render's free tier, plain Docker containers) lose these images.
- **Run only one copy of the server.** It syncs courses from the invoice site on its own every 30 minutes, and extra copies just repeat that work.
- **Back up the database regularly:**
  ```bash
  sudo mysqldump student_portal > ~/backup-$(date +%F).sql
  ```
- **Never commit `.env` to GitHub.** If a key or password ever leaks, change it straight away (and ask the invoice team for a new API key).
