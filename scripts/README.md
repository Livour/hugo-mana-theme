# Scripts

Helper tools that aren't required for using the theme, but may help with some tasks. These things are optional, so don't worry if you don't know why someone would want these things.

## Listing

### Section Management

For those wanting to take advantage of Hugo's [sections](https://gohugo.io/content-management/sections/) but not wanting to manage the `_index.md` files manually, this script handles it for you.

Note that as with any tool that modifies your content in any way, you should enesure your files are backed up and/or tracked in a VCS (e.g. `git`).

For those curious, a sample folder hierarchy that benefits from this could be `content/posts/1978/11/18/do-you-remember-the-21st-of-september.md`.

#### Usage

These commands assume you're in your site's base folder, with this repo saved in `themes/mana/`.

To create default sections: `python3 themes/mana/scripts/sections.py generate content/posts`

To clean up sections: `python3 themes/mana/scripts/sections.py cleanup content/posts`

So what is each of these commands doing? The `generate` command will navigate the folder hierarchy under `content/posts` and add `_index.md` files to every folder, and attempt to auto-generate a title. Note that this script assumes there aren't any existing `_index.md` files, and so it will overwrite any that exist. The `cleanup` command does the reverse of `generate`: it'll navigate the specified folder hierarchy and delete any `_index.md` files it finds.
