# Blog Images Directory

This directory stores images that are embedded within blog posts (not thumbnails).

## How to Use

1. **Add your images here**: Place any images you want to use in blog posts in this directory

   - Example: `diagram.jpg`, `screenshot.png`, `code-example.png`

2. **Reference in markdown**: Use standard markdown syntax or bracket syntax
   ```markdown
   ![Alt text](image-name.jpg)
   ```
   or
   ```markdown
   [[image-name.jpg]]
   ```

## Supported Formats

- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.webp`
- `.svg`

## Example

If you have a blog post at `files/Blogs/my-tutorial.md` and want to include images:

1. Place images in this directory:

   - `files/Blog-Images/step1.png`
   - `files/Blog-Images/step2.png`
   - `files/Blog-Images/final-result.jpg`

2. Reference them in your markdown:

   ```markdown
   # My Tutorial

   Here's the first step:
   ![Step 1: Setup](step1.png)

   Now do this:
   ![Step 2: Configuration](step2.png)

   And here's the result:
   ![Final result](final-result.jpg)
   ```

The images will automatically be served via the API endpoint and displayed in your blog post!
