# Hugo Mana Theme

Futuristic hugo theme featuring clean aesthetics, and modern functionality and responsive design.

## Features

- **Fully responsive** design with mobile-first approach
- **RTL support** for Right-to-Left languages (Hebrew, Arabic, etc.) with mirrored layout
- **Full-text search** with JSON index and keyboard navigation
- **Syntax highlighting** with theme-aware Chroma (Catppuccin themes)
- **Table of Contents** with active section highlighting
- **Blockquotes and Alerts** with support for GitHub/Obsidian-style admonitions
- **Dark/Light theme** with system preference detection and manual toggle
- **Post filtering** by tags, year, and month
- **Archive pages** with chronological organization
- **SEO optimized** with Open Graph, Twitter Cards, and structured data
- **Performance optimized** with asset minification and caching
- **Integrations**: Buy Me a Coffee, Umami Analytics, social links

## Installation

This theme is installed as a Git submodule. To add it to your Hugo site:

```bash
git submodule add https://github.com/Livour/hugo-mana-theme.git themes/mana
```

Then set `theme = "mana"` in your `hugo.toml` configuration file.

## Requirements

- Hugo Extended version 0.100.0 or higher (required for PostCSS support)

## Configuration

Add the following configuration to your `hugo.toml` file. You can also reference the `example.toml` file in the theme root for a complete example configuration.

### Basic Configuration

```toml
[params]
  description = "Your site description"
  favicon = "/favicon/favicon.ico"
  footerText = "Built with Hugo and Mana theme"  # Optional
  
  # Hero section title (optional - defaults to site.Title)
  heroTitleLine1 = "Your Site Name"  # First line of hero title
  heroTitleLine2 = "Your Tagline"    # Second line of hero title (optional)
```

### Avatar

Configure your avatar image (displayed on home page hero and about page). Use either `assetPath` (project asset) or `url` (external URL):

```toml
[params.avatar]
  [params.avatar.home]
    assetPath = "images/transparent-logo.png"
  [params.avatar.about]
    assetPath = "images/logo.png"
```

### Social Links

Add your social media links:

```toml
[params.social]
  github = "https://github.com/yourusername"
  gitlab = "https://gitlab.com/yourusername"
  linkedin = "https://www.linkedin.com/in/yourprofile"
  email = "your.email@example.com"
```

### Buy Me a Coffee Widget

Enable the Buy Me a Coffee floating widget:

```toml
[params.buyMeACoffee]
  enabled = true
  id = "yourwidgetid"
  message = ""  # Optional message
  color = "#BD5FFF"  # Widget color
  position = "Right"  # "Left" or "Right"
  x_margin = "18"  # Horizontal margin in pixels
  y_margin = "18"  # Vertical margin in pixels
```

**Note:** The widget description text is configured per language in i18n files (`buyMeACoffeeDescription` in `en.toml`, `he.toml`, etc.).

### Menu Configuration

Configure your site navigation menu.

**Single-language sites:** Use root-level `[[menus.main]]`:

```toml
[[menus.main]]
  name = 'Home'
  pageRef = '/'
  weight = 10

[[menus.main]]
  name = 'Posts'
  pageRef = '/posts'
  weight = 20

[[menus.main]]
  name = 'Tags'
  pageRef = '/tags'
  weight = 30

[[menus.main]]
  name = 'About'
  url = '/about/'
  weight = 40
```

**Multilingual sites:** Define menus per language in `[[languages.<lang>.menus.main]]` (see [Multilingual Configuration](#multilingual-configuration)).

### Pagination

The theme includes pagination for the posts listing page (Sorted by date).
Configure the number of posts per page:

```toml
[pagination]
  pageSize = 10  # Number of posts per page (default: 10)
```

The pagination controls include:
- **First/Last page links** - Jump to the beginning or end
- **Previous/Next links** - Navigate sequentially
- **Page numbers** - Direct navigation to specific pages
- **Current page indicator** - Shows which page you're on
- **Page information** - Displays total posts and pages

Pagination automatically appears when you have more posts than the configured `pageSize`. The controls are designed

### Table of Contents

Enable table of contents for posts:

```toml
[markup]
  [markup.tableOfContents]
    startLevel = 1
    endLevel = 6
    ordered = false
```

### Blockquotes and Alerts

The theme includes support for styled blockquotes and GitHub/Obsidian-style alerts (admonitions). To enable this feature, add the following configuration:

```toml
[markup]
  [markup.goldmark]
    [markup.goldmark.parser]
      # Enable block-level attributes for blockquotes
      [markup.goldmark.parser.attribute]
        block = true
        title = true
```

#### Usage

**Regular blockquote:**
```markdown
> This is a regular blockquote with some text.
```

**Simple alert/admonition:**
```markdown
> [!TIP]
> This is a helpful tip for your readers.
```

**Collapsible alert with custom title:**
```markdown
> [!WARNING]+ Custom Warning Title
> This is a collapsible warning that can be expanded/collapsed.
```

#### Supported Alert Types

The theme supports the following alert types:
- `NOTE` / `INFO` - Informational content
- `TIP` - Helpful tips and suggestions
- `IMPORTANT` - Important information
- `WARNING` / `CAUTION` - Warnings and cautions
- `SUCCESS` - Success messages
- `QUESTION` - Questions or prompts
- `DANGER` - Critical warnings
- `BUG` - Bug reports or known issues
- `EXAMPLE` - Example content

#### Collapsible Alerts

Use `+` or `-` after the alert type to make it collapsible:
- `[!TIP]+` - Collapsed by default (click to expand)
- `[!TIP]-` - Expanded by default (click to collapse)

You can also add a custom title:
```markdown
> [!NOTE]+ My Custom Title
> This alert has a custom title instead of the default "Note".
```

The syntax is compatible with GitHub Flavored Markdown, Obsidian, and Typora.

#### Admonition Display Style

Choose between favicon icons or emoji for alert headers:

```toml
[params.admonitions]
  alertStyle = "favicon"  # "favicon" (default) or "emoji"
```

### Code Syntax Highlighting

The theme supports theme-aware syntax highlighting using Chroma. By default, it uses Catppuccin themes:
- **Dark mode**: `catppuccin-macchiato`
- **Light mode**: `catppuccin-frappe`

Configure the themes in your `hugo.toml`:

```toml
[markup]
  [markup.highlight]
    codeFences = true
    guessSyntax = true
    noClasses = false
    style = "catppuccin-macchiato"  # Default style

[params]
  [params.codeHighlight]
    darkTheme = "catppuccin-macchiato"   # Theme for dark mode
    lightTheme = "catppuccin-frappe"     # Theme for light mode
```

#### Generating Syntax Highlighting CSS

To generate the CSS files for syntax highlighting, run these commands in your project root:

```bash
# Generate dark theme CSS
hugo gen chromastyles --style=catppuccin-macchiato > themes/mana/assets/css/syntax-dark.css

# Generate light theme CSS
hugo gen chromastyles --style=catppuccin-frappe > themes/mana/assets/css/syntax-light.css
```

**Note**: These CSS files are already included in the theme. You only need to regenerate them if you want to use different Chroma styles. You can use any valid Chroma style name (e.g., `github`, `monokai`, `dracula`, etc.).

### Search Index

Enable JSON output for search functionality:

```toml
[outputs]
  home = ["HTML", "JSON"]
```

### Multilingual Configuration

The theme supports multiple languages with a language switcher in the header.

**Required:** Set `defaultContentLanguage = "en"` (or your preferred default) in your config for multilingual sites to work correctly.

**Add a language:** Add a `[languages.<lang>]` block and create `themes/mana/i18n/<lang>.toml` with translated strings. Copy from `en.toml` and translate each key. The theme includes `en.toml` and `he.toml` by default; add new files for additional languages.

**Remove a language:** Delete the `[languages.<lang>]` block. With only one language, the switcher is hidden.

**Content:** Place content in `content/<lang>/` (e.g. `content/en/`, `content/he/`).

**RTL (Right-to-Left) support:** For Hebrew, Arabic, or other RTL languages, set `languageDirection = "rtl"` in the language block. The theme automatically applies:
- Mirrored navigation and layout
- Right-aligned text and proper text flow
- Mobile menu sliding from the right
- RTL-specific styles for filters, search, tables of contents, and post metadata

**Buy Me a Coffee description:** Add `buyMeACoffeeDescription` to each language's i18n file instead of config.

Example minimal config for English + Hebrew (RTL):

```toml
defaultContentLanguage = "en"

[languages.en]
  languageCode = "en-US"
  languageName = "English"
  languageDirection = "ltr"
  contentDir = "content/en"
  weight = 1
  title = "Your Site Title"
  [languages.en.params]
    description = "Your site description"
    author = "Your Name"
    heroTitleLine1 = "YOUR SITE NAME"
    heroTitleLine2 = "YOUR TAGLINE"
    custom404Message = "Sorry, the page you are looking for could not be found."
    footerText = "Built with Hugo and Mana theme"
  [[languages.en.menus.main]]
    name = "Home"
    pageRef = "/"
    weight = 10
  # ... other menu items

[languages.he]
  languageCode = "he-IL"
  languageName = "עברית"
  languageDirection = "rtl"
  contentDir = "content/he"
  weight = 2
  title = "Your Site Title"
  [languages.he.params]
    description = "Your site description"
    author = "Your Name"
    heroTitleLine1 = "YOUR SITE NAME"
    heroTitleLine2 = "YOUR TAGLINE"
    custom404Message = "Sorry, the page you are looking for could not be found."
    footerText = "Built with Hugo and Mana theme"
  [[languages.he.menus.main]]
    name = "בית"
    pageRef = "/"
    weight = 10
  # ... other menu items (see example.toml for full reference)
```

See `example.toml` for a complete reference.

### 404 Page Configuration

Customize the 404 error page message per language in `[languages.<lang>.params]`:

```toml
[languages.en.params]
  custom404Message = "Sorry, the page you are looking for could not be found. I guess I don't have a guide for <em>everything</em>"
```

The 404 page uses the same hero section styling as your home page, providing a consistent user experience.

### Umami Analytics

The theme supports Umami Analytics for privacy-friendly page tracking:

```toml
[params]
  [params.umami]
    # Set your Umami website ID for page tracking
    websiteId = "your-umami-website-id"
```

To use Umami:
1. Sign up for an account at [Umami Cloud](https://umami.is/) or self-host Umami
2. Create a website in your Umami dashboard
3. Copy your website ID and add it to your configuration

The Umami script will be automatically included in your site's `<head>` section.

## Post Frontmatter

The theme supports standard Hugo frontmatter. For post images, add an `image` parameter:

```markdown
---
title: "Your Post Title"
date: 2024-01-01
tags: ["tag1", "tag2"]
image: "/images/your-image.png"
---
```

## Pages

The theme includes layouts for:
- **Home page** - Displays mini about section and recent posts
- **Posts listing** - Shows all posts with filtering
- **Single post** - Individual post view with metadata and table of contents
- **Tags page** - Tag cloud view
- **Individual tag page** - Posts grouped by year for each tag
- **About page** - About page with avatar and social links
- **404 page** - Custom error page with hero section styling

## License

MIT

