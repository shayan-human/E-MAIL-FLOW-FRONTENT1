# Linux Independence Running Guide

This guide explains how to run the `campaign-scheduler` project independently on a Linux system, suitable for production-like environments or long-running local setups.

## Prerequisites

- **Node.js**: Version 18 or higher.
- **NPM**: Normally included with Node.js.
- **Environment Variables**: Ensure your `.env` or `.env.local` file is present in the project root with all necessary credentials (Supabase, OpenAI, etc.).

## Method 1: Using PM2 (Recommended)

PM2 is a production process manager for Node.js applications with a built-in load balancer. It allows you to keep applications alive forever and reload them without downtime.

1.  **Install PM2 globally:**
    ```bash
    npm install -g pm2
    ```

2.  **Build the project:**
    ```bash
    cd /path/to/Aur/campaign-scheduler
    npm run build
    ```

3.  **Start the application:**
    ```bash
    pm2 start npm --name "campaign-scheduler" -- start
    ```

4.  **Manage the process:**
    -   **View status:** `pm2 list`
    -   **View logs:** `pm2 logs campaign-scheduler`
    -   **Stop:** `pm2 stop campaign-scheduler`
    -   **Restart:** `pm2 restart campaign-scheduler`

5.  **Enable start on boot:**
    ```bash
    pm2 startup
    pm2 save
    ```

---

## Method 2: Using Systemd (Native Linux)

If you prefer not to use PM2, you can use `systemd` to manage the service.

1.  **Create a service file:**
    ```bash
    sudo nano /etc/systemd/system/campaign-scheduler.service
    ```

2.  **Paste the following configuration** (update paths and user):
    ```ini
    [Unit]
    Description=Campaign Scheduler Next.js App
    After=network.target

    [Service]
    Type=simple
    User=shayan
    WorkingDirectory=/home/shayan/Documents/coding/Aur/campaign-scheduler
    Environment=NODE_ENV=production
    ExecStart=/usr/bin/npm start
    Restart=always

    [Install]
    WantedBy=multi-user.target
    ```

3.  **Start and enable the service:**
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable campaign-scheduler
    sudo systemctl start campaign-scheduler
    ```

4.  **View logs:**
    ```bash
    journalctl -u campaign-scheduler -f
    ```

---

## Method 3: Running in Background (Simple)

For a quick independent run without full process management:

```bash
nohup npm start > app.log 2>&1 &
```
*Note: This will not restart automatically if the system reboots or the app crashes.*

---

## Accessing the App

Once running, the application will be accessible at:
`http://localhost:3000` (or the port specified in your configuration).
