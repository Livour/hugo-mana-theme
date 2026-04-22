import os
import sys
from collections.abc import Callable


def generate_title(path: str, root_dir: str) -> str:
    trimmed = (
        path
        .removeprefix(root_dir)
        .removeprefix('/')  # Account for the user not using a trailing slash.
    )

    return f'Posts for {trimmed}'


def make_section(path: str, root_dir: str) -> None:
    content = f'---\ntitle: {generate_title(path, root_dir)}\n---'
    with open(f'{path}/_index.md', 'w') as f:
        f.write(content)


def remove_section(path: str, root_dir: str) -> None:
    if os.path.isfile(f'{path}/_index.md'):
        os.remove(f'{path}/_index.md')


def walk_tree(root_dir: str, task: Callable[[str, str], None]) -> None:
    for dir_path, dir_names, file_names in os.walk(root_dir):
        if dir_path == root_dir:
            continue

        task(dir_path, root_dir)


def print_usage() -> None:
    print('Usage:')
    print('python3 sections.py [command] [path]')
    print()
    print('[command] must be one of "generate" or "cleanup"')
    print()
    print('[path] must be the path to your content')
    print()
    print('Example: python3 sections.py generate content/posts')


def main() -> None:
    if len(sys.argv) != 3:
        print_usage()
        sys.exit(1)

    command: Callable

    # Ensure command is in [generate, cleanup]
    if sys.argv[1] == 'generate':
        command = make_section
    elif sys.argv[1] == 'cleanup':
        command = remove_section
    else:
        print(f'Unknown command: {sys.argv[1]}.')
        print_usage()
        sys.exit(1)

    # Verify target_path exists and is a folder
    target_path = sys.argv[2]
    if not os.path.isdir(target_path):
        print(f'Path ({target_path}) does not appear to be a directory.')
        sys.exit(1)

    walk_tree(target_path, command)


# Only execute if explicitly invoked.
# Prevents unexpected behaviour if someone imports this file.
if __name__ == "__main__":
    main()
