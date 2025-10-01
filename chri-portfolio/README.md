# Christina's Portfolio

A modern portfolio website built with Next.js 15, featuring projects and blog posts served from local files.

## Features

- Local file-based content management
- PDF project viewer
- Markdown blog posts with syntax highlighting
- Automatic thumbnail matching
- Dark/Light theme support
- Fast performance with Next.js 15

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository

```bash
git clone https://github.com/TotoBarbota/Chri-Portfolio.git
cd Chri-Portfolio/chri-portfolio
```

2. Install dependencies

```bash
pnpm install
```

3. Add your content

   - Place PDF projects in `files/Projects/`
   - Place Markdown blogs in `files/Blogs/`
   - Place thumbnail images in `files/Pictures/`
   - Place blog content images in `files/Blog-Images/`

4. Run the development server

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Content Management

### Adding Projects

1. Add your PDF file to `files/Projects/`

   ```
   files/Projects/my-project.pdf
   ```

2. (Optional) Add a description file

   ```
   files/Projects/my-project.description
   ```

   Content: Plain text description

3. (Optional) Add a thumbnail to `files/Pictures/`
   ```
   files/Pictures/my-project.jpg
   ```

### Adding Blog Posts

1. Add your Markdown file to `files/Blogs/`

   ```
   files/Blogs/my-blog-post.md
   ```

2. Use frontmatter for metadata (optional)

   ```markdown
   ---
   title: My Blog Post
   date: 2025-01-01
   author: Christina
   ---

   # My Blog Post

   Content here...
   ```

3. (Optional) Add a thumbnail to `files/Pictures/`

   ```
   files/Pictures/my-blog-post.png
   ```

4. (Optional) Add images for use within the blog post to `files/Blog-Images/`

   ```
   files/Blog-Images/diagram.jpg
   files/Blog-Images/screenshot.png
   ```

   Then reference them in your markdown:

   ```markdown
   ![Diagram](diagram.jpg)
   ```

   or using bracket syntax:

   ```markdown
   [[screenshot.png]]
   ```

### Thumbnail Matching

Thumbnails are automatically matched by filename (without extension):

- `my-project.pdf` → `my-project.jpg`
- `my-blog.md` → `my-blog.png`

Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

## Project Structure

```
chri-portfolio/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── blogs/             # Blog pages
│   ├── projects/          # Project pages
│   └── about/             # About page
├── components/            # React components
├── lib/                   # Utility libraries
│   └── local-files.ts     # File system utilities
├── files/                 # Content directory
│   ├── Projects/          # PDF projects
│   ├── Blogs/             # Markdown blogs
│   ├── Blog-Images/       # Images for blog content
│   └── Pictures/          # Thumbnails
└── public/                # Static assets
```

## Deployment

The portfolio can be deployed to any Next.js hosting platform:

- [Vercel](https://vercel.com) (recommended)
- [Netlify](https://netlify.com)
- [Railway](https://railway.app)
- Self-hosted with Docker

The `files/` directory will be included in your deployment automatically.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **PDF Viewer**: React PDF Viewer
- **Markdown**: react-markdown with syntax highlighting
- **Theme**: next-themes

## Migration from Google Drive

This project was migrated from Google Drive API to local file storage. See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for details.

## Todo

- ~~Make markdown files able to show embedded pictures~~ (Complete! Use `files/Blog-Images/`)
- Add search functionality
- Add tags/categories for projects and blogs
- Add RSS feed for blog posts

## License

MIT

## Author

Christina - [GitHub](https://github.com/TotoBarbota)
