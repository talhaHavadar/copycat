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
    List {},
    Enable {},
    Disable {},
}

fn main() {
    env_logger::init();
    info!("Hello logging!");
    let args = Cli::parse();

    println!("cli: {:?}", args);
    println!("Hello, world!");
}
