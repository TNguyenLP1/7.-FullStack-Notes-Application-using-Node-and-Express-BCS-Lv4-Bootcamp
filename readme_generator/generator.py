from rich.console import Console
# Importing template

from readme_generator.templates import README_TEMPLATE
# Importing console for rich text output

console = Console()
# Create a class to handle file creation


class ReadmeGenerator:
# Create class as ReadmeGenerator

    """Handling README file generation and saving."""
    # Add notes here for tracking purposes and documentation

    def __init__(self, data: dict):
        self.data = data
    # define user data input

    def generate_content(self) -> str:
        """Generate file content based on user input."""
    # Define function to generate content as needed

        return README_TEMPLATE.format(**self.data)
        # Setting return to format template with user data input

    def save_file(self, content: str, filename: str = "README.md"):
        """Save the generated README to a file."""
    # Define function to save file

        try:
        # Try to write file

            with open(filename, "w", encoding="utf-8") as file:
            # Setting file to write

                file.write(content)
                # Setting write content to file

            console.print(f"\n [bold green]✓ README.md file successfully created! [/bold green]")
            # Setting print success message

        except Exception as e:
        # Setting exception handling for error 

            console.print(f" [bold red]X Error writing file: [/bold red] {e}")
            # Setting print error message