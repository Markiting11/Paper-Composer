# Paper Composer

Transform handwritten notes and exam papers into professionally formatted, print-ready A4 digital documents using AI-powered OCR and formatting.

## Deployment Instructions

This application is built with React, Vite, and Tailwind CSS. It can be easily deployed to platforms like **Vercel** or **Netlify**.

### Environment Variables

The application requires a Gemini API key to function. You must set the following environment variable in your deployment platform's settings:

- `GEMINI_API_KEY`: Your Google Gemini API key. You can get one from [Google AI Studio](https://aistudio.google.com/).

### Deploying to Vercel

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add the `GEMINI_API_KEY` environment variable.
4. Vercel will automatically detect Vite and use `npm run build` with the `dist` output directory.

### Deploying to Netlify

1. Push your code to a GitHub repository.
2. Import the project into Netlify.
3. Add the `GEMINI_API_KEY` environment variable in the "Site configuration" > "Environment variables" section.
4. Netlify will use the `netlify.toml` file included in the repository for routing configuration.

## Local Development

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Create a `.env.local` file and add your `GEMINI_API_KEY`.
4. Start the development server: `npm run dev`.
