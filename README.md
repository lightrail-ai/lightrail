# 🪄 Lightwand

Lightwand is an open-source platform for building React/Tailwind front-end UIs with the help of LLMs. It aspires to create clean, well-organized codebases that can be easily exported and edited manually. Support for adding interactive functionality within the Lightwand platform is coming soon. It is currently most useful for scaffolding a UI / layout, then exporting it and adding functionality separately.

## Try It Out

The hosted version of Lightwand is available at: https://lightwand.dev

## Dependencies / Structure

Lightwand is a [Next.js](https://nextjs.org/) application that relies on the [OpenAI GPT-3.5 API](https://platform.openai.com/) as well as [Supabase](https://supabase.com/).

## Running / Developing Locally

1. Clone this repository
2. Create a file called `.env.local` in the top-level directory, with these contents:

```
OPENAI_API_KEY=...your OpenAI API Key....
NEXT_PUBLIC_SUPABASE_URL=...your Supabase instance URL...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...your Supabase anon key...
NEXT_PUBLIC_LOGIN_REDIRECT_URL="http://localhost:3000/auth/callback"
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
```

3. Run `npm install`
4. Run `npm run dev`
5. Lightwand should now be running locally. Navigate to [http://localhost:3000/projects](http://localhost:3000/projects) to begin using it.

## Roadmap

Lightwand is very much a work-in-progress, and you're likely to run into bugs. Please report any bugs you find in the Issues section of this repository. PRs are also welcome!
Below is a rough roadmap of development plans:

[x] Generating Complete Component Trees
[x] Editing individual components
[x] User accounts
[x] Exporting to Next.js
[ ] Creating new components
[ ] Linking Data Sources / DBs
[ ] Uploading images
[ ] Generating images
[ ] Supporting interactivity
