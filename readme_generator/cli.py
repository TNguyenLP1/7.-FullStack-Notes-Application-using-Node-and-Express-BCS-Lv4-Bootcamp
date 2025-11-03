
from InquirerPy import prompt
from rich.console import Console

console = Console()
# Create a CLI class to handle unser prompts

class CLI:
# Setting what CLI will ask user
    """Handles interactive CLI prompts."""
    # Add notes here for tracking purposes and documentation

    def __init__(self):
    # Define questions to ask use
        self.questions = [
        # Setting up questions for input

            {
                "type": "input",
                "name": "title",
                "message": "Enter your project title:",
            },
            # Add title

            {
                "type": "input",
                "name": "description",
                "message": "Enter a short project description:",
            },
            # Add description

            {
                "type": "input",
                "name": "technologies",
                "message": "Enter technology used for this project:",
            },
            # Add technology used to showcase project

            {
                "type": "input",
                "name": "usage",
                "message": "Enter usage for this project:",
            },
            # Add usage instructions

            {
                "type": "input",
                "name": "howto",
                "message": "Enter usage instruction for this project:",
            },
            # Add how to use instructions

            {
                "type": "list",
                "name": "license",
                "message": "Choose a license:",
                "choices": [
                    "MIT License",
                    "Apache License 2.0",
                    "GNU General Public License v3 (GPLv3)",
                    "GNU Lesser General Public License v3 (LGPLv3)",
                    "Mozilla Public License 2.0 (MPL 2.0)",
                    "Creative Commons (CC0)",
                    "Creative Commons (CC BY-SA)",
                    "Unlicense",
                    "Commercial License Only - \"See Licence.md\"",
                ],
            },
            # Add license selector

            {
                "type": "input",
                "name": "author",
                "message": "Enter author name:",
            },
            # Add author acknowledgement

            {
                "type": "input",
                "name": "contact",
                "message": "Enter contact information (e.g., email or GitHub):",
            },
            # Add contact information
        ]

    def collect_user_input(self) -> dict:
        """Prompt the user for project details."""
        console.print("[bold cyan]Welcome to the GitHub README Generator![/bold cyan]\n")
        answers = prompt(self.questions)
        console.print("\n[bold green]✓ Input collected successfully![/bold green]\n")
        return answers
    # Add function to collect user input