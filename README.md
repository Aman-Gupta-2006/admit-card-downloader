# Admit Card Downloader

Small Node.js script that uses Puppeteer to log into the DTU registration site and save the admit card as a PDF.

## Purpose

Admit cards are often released only 2–3 days before an exam, which is a hectic period for students. That short window makes it easy to miss the download or waste time navigating the site at the last minute. This project automates the login and PDF generation steps so you can quickly retrieve and save your admit card with a single command, reducing stress during exam season.

## Quick start

1. Copy `.env.example` to `.env` and fill in your credentials and desired output path.
2. Install dependencies:

```
npm install
```

3. Run the script:

```
node admitcardDownload.js 
```

or you can use 

```
nodemon admitcardDownload.js 
```

## Files of interest

- `admitDownload.js` — main script.
- `.env` — (not committed) contains secrets: ROLL_NUMBER, PASSWORD, ADMIT_DOWNLOAD_PATH.

## Security notes

Do not commit `.env` or any credentials. Use GitHub Secrets for CI and consider rotating credentials periodically.

## License

MIT