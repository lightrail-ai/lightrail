# 🚈 Lightrail 

[![](https://dcbadge.vercel.app/api/server/57bNyxgb7g)](https://discord.gg/57bNyxgb7g)

Lightrail is an open-source platform for building React/Tailwind front-end UIs with the help of LLMs. It aspires to create clean, well-organized codebases that can be easily exported and edited manually. Support for adding interactive functionality within the Lightrail platform is coming soon. It is currently most useful for scaffolding a UI / layout, then exporting it and adding functionality separately.

## Demo



https://github.com/vishnumenon/lightrail/assets/1093632/e6a94fee-6858-4ab4-bdb3-777d8fa39335



## Try It Out

The hosted version of Lightrail is available at: https://lightrail.ai

## Dependencies / Structure

Lightrail is a [Next.js](https://nextjs.org/) application that relies on the [OpenAI GPT-3.5/4 API](https://platform.openai.com/) as well as [Supabase](https://supabase.com/).

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

3. Make sure Auth in Supabase is configured to use the specified server / redirect URLs
4. Run `npm install`
5. Run `npm run dev`
6. Lightrail should now be running locally. Navigate to [http://localhost:3000/projects](http://localhost:3000/projects) to begin using it.

## Roadmap

Lightrail is very much a work-in-progress, and you're likely to run into bugs. Please report any bugs you find in the Issues section of this repository. PRs are also welcome!
Below is a rough roadmap of development plans:

- [x] Generating Complete Component Trees
- [x] Editing individual components
- [x] User accounts
- [x] Exporting to Next.js
- [x] Creating new components
- [x] Supporting interactivity (partially done)
- [ ] Uploading images
- [ ] Generating images
- [ ] Linking Data Sources / DBs
