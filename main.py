from readme_generator.cli import CLI
# Importing modules needed for CLI and README generation

from readme_generator.generator import ReadmeGenerator
# Importing ReadmeGenerator class to handle file creation

from rich.console import Console
# Importing console from rick for styling output

from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn
# Importing progress components for visual feedback

import time
# Importing time module to simulate delays

console = Console()
# Setting console 


def main():
# Define main function to start 

    console.print("[bold blue] Starting README.md Generator...[/bold blue]\n")

    with Progress(
    # Setting progress bar

        SpinnerColumn(),
        # Add spinner to indicate processing

        BarColumn(),
        # Add bar to show progress

        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        # Add percentage completion display

        TextColumn("{task.description}"),
        # Add task description 

        transient=True,  
        # Clears bar when done

    ) as progress:
        # Adding context manager for progeress bar
        
        task = progress.add_task("Generating README.md...", total=100)
        # Define task with steps

        for i in range(100):
            # Loop to simulate progression

            time.sleep(0.03)  
            # Simulate work being done

            progress.update(task, advance=1)
            # Updating progress bar

    # Setting up progress bar for user experience

    cli = CLI()
    user_data = cli.collect_user_input()
    # Collect user input

    generator = ReadmeGenerator(user_data)
    content = generator.generate_content()
    # Generate markdown content
    
    with Progress(
    # Setting progress bar

        SpinnerColumn(),
        # Add spinner to indicate processing

        BarColumn(),
        # Add bar to show progress

        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        # Add percentage completion display

        TextColumn("{task.description}"),
        # Add task description 

        transient=True,  
        # Clears bar when done

    ) as progress:
        # Adding context manager for progeress bar
        
        task = progress.add_task("Writing README.md...", total=100)
        # Define task with steps

        for i in range(100):
            # Loop to simulate progression

            time.sleep(0.03)  
            # Simulate work being done

            progress.update(task, advance=1)
            # Updating progress bar

    # Setting up progress bar for user experience

    generator.save_file(content)
    # Save to README.md

    console.print("\n[bold cyan] All done! Your README.md is ready![/bold cyan]\n")
    # Setting print message for completion


if __name__ == "__main__":
    main()
# Run main function if script is executed directly