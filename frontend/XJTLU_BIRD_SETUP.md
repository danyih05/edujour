# XJTLU Bird Setup

## 1. Configure the API key

Add your real DeepSeek key to either the repository root `.env` or `frontend/.env`:

```bash
VITE_DEEPSEEK_API_KEY=sk-your-real-key
```

If both files exist, `frontend/.env` wins. Both locations stay local because `.env` is ignored by git.

## 2. Run the frontend

```bash
cd frontend
npm run dev
```

## 3. Use the assistant

1. Open the app.
2. Click the floating bird in the bottom-right corner.
3. Start chatting.

If you do not set `frontend/.env`, the widget can still accept a key in the browser and store it in `localStorage`.

## Notes

- This integration calls DeepSeek directly from the browser.
- For production use, move the DeepSeek request behind a backend proxy if you need to protect the API key.
