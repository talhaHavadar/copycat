use clap::{Parser, Subcommand};
use log::{debug, info, warn};
use std::any::Any;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use zeroconf::prelude::*;
use zeroconf::{
    MdnsBrowser, MdnsService, ServiceDiscovery, ServiceRegistration, ServiceType, TxtRecord,
};

static SERVICE_PORT: u16 = 7979;

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
    Daemon {},
    /// Lists the devices discovered by Copycat
    List {},
    /// Enables clipboard sharing between devices
    Enable {},
    /// Disables clipboard sharing between devices
    Disable {},
}

#[derive(Default, Debug)]
pub struct Context {
    service_name: String,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();
    info!("Hello logging!");
    let Cli {
        command,
        device_name,
    } = Cli::parse();

    match command {
        Commands::Daemon {} => {
            let mut service = MdnsService::new(ServiceType::new("_copycat", "tcp")?, SERVICE_PORT);
            let context: Arc<Mutex<Context>> = Arc::default();
            service.set_registered_callback(Box::new(on_service_registered));
            service.set_context(Box::new(context));

            let event_loop = service.register()?;

            loop {
                // calling `poll()` will keep this service alive
                event_loop.poll(Duration::from_secs(0))?;
            }
        }
        Commands::List {} => {
            if device_name.is_some() {
                println!("device_name: {:?}", device_name.unwrap());
            }
        }
        Commands::Enable {} => {}
        Commands::Disable {} => {}
    }
    Result::Ok(())
}
fn start_browser(context: Box<dyn Any>) {
    let mut browser = MdnsBrowser::new(ServiceType::new("_copycat", "tcp").unwrap());
    browser.set_service_discovered_callback(Box::new(on_service_discovered));
    browser.set_context(context);

    let event_loop = browser.browse_services().unwrap();

    loop {
        event_loop.poll(Duration::from_secs(0)).unwrap();
    }
}

fn on_service_discovered(
    result: zeroconf::Result<ServiceDiscovery>,
    context: Option<Arc<dyn Any>>,
) {
    let service = match result {
        Ok(s) => s,
        Err(e) => {
            warn!("on_service_discovered(): `{:?}`", e);
            return;
        }
    };

    let context_mtx = context
        .as_ref()
        .expect("could not get context")
        .downcast_ref::<Arc<Mutex<Context>>>()
        .expect("error down-casting context")
        .clone();

    let mut context = context_mtx.lock().unwrap();

    if &context.service_name == service.name() {
        debug!("Ignoring {:?}", context.service_name);
        return;
    }

    debug!("Service discovered: {:?}", &service);

    // context.discovered.insert(UniqueService::new(
    //     service.name().to_owned(),
    //     service.host_name().to_owned(),
    // ));
}

fn on_service_registered(
    result: zeroconf::Result<ServiceRegistration>,
    context: Option<Arc<dyn Any>>,
) {
    let service = result.expect("failed to register service");

    info!("Service registered: {:?}", service);

    let context = context
        .as_ref()
        .expect("could not get context")
        .downcast_ref::<Arc<Mutex<Context>>>()
        .expect("error down-casting context")
        .clone();

    context
        .lock()
        .expect("failed to obtain context lock")
        .service_name = service.name().clone();

    info!("Context: {:?}", context);

    thread::spawn(|| start_browser(Box::new(context)));
}
