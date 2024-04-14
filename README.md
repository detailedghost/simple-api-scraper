# Simple File Scraper API Download

A simple API that allows users to send a payload with an optional secret to a specific download file system.

> [!IMPORTANT]
> It is a good idea to provide a web hook secret via environment variable `WEBHOOK_SECRET` to prevent unauthorized access to the API.

## Getting Started
### Project
1. To install dependencies:
```sh
bun install
```
2. To run:
```sh
bun run dev
```

3. Open http://localhost:3000

### Docker image
1. Download and install docker
2. Build the image. Example: `docker build -t api-download .`
3. Run the image. Example: `docker run -p 3000:3000 -v <Parent File Path>:/usr/src/app/mnt api-download`
