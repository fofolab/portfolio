# fofola V2.0

This is the final V2.0 portfolio site for fofola.

## Local Preview

```bash
pnpm install
pnpm run dev
```

## Production Build

```bash
pnpm run build
```

The production output is generated in `dist/`.

## Recommended Deployment

Use `app-v2` as the project root when deploying to Vercel, Netlify, Cloudflare Pages, or any static hosting provider.

Build command:

```bash
pnpm run build
```

Output directory:

```bash
dist
```

## V2.0 Notes

- V2.0 is the current final release version.
- V1.0 is preserved separately and should not be overwritten.
- The cover uses the final logo animation and reveals the supporting cover text after playback.
- GitHub Pages deployment is handled from the `app-v2` build output.

## GitHub Pages

The repository includes a GitHub Actions workflow at `.github/workflows/deploy-app-v2.yml`.

In GitHub, open `Settings -> Pages` and set `Source` to `GitHub Actions`.

### Custom Domain

The production domain is:

```text
fofo-lab.com
```

`public/CNAME` is already included, so the built site publishes the same domain file into `dist/CNAME`.

In the domain DNS panel, point the apex domain to GitHub Pages:

```text
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
```

If `www.fofo-lab.com` is needed, add:

```text
CNAME www   <your-github-username>.github.io
```

After DNS resolves, open `Settings -> Pages`, set the custom domain to `fofo-lab.com`, then enable `Enforce HTTPS`.

### Launch Check

Before publishing:

```bash
pnpm install
pnpm run build
```

The final static output is `app-v2/dist`.
