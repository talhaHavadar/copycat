use clap::{Parser, Subcommand};
use log::{info, warn};

#[derive(Parser, Debug)]
#[command(name = "copycat")]
#[command(bin_name = "copycat")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
    #[arg()]
    device_name: Option<String>,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Lists the devices discovered by Copycat
    List {},
    /// Enables clipboard sharing between devices
    Enable {},
    /// Disables clipboard sharing between devices
    Disable {},
}

fn main() {
    env_logger::init();
    info!("Hello logging!");
    let args = Cli::parse();

    match args.command {
        Commands::List {} => {}
        Commands::Enable {} => {}
        Commands::Disable {} => {}
    }
}
