use std::env;
use std::fs;
use std::path::Path;
use std::process::Command;

pub(crate) fn open_local_folder(path: &Path) -> Result<(), String> {
    fs::create_dir_all(path)
        .map_err(|error| format!("Could not create folder {}: {error}", path.display()))?;
    if cfg!(test) || env::var("CIVICSUITE_SUPPRESS_OPEN_FOLDER").ok().as_deref() == Some("1") {
        return Ok(());
    }

    let mut command = if cfg!(target_os = "windows") {
        Command::new("explorer.exe")
    } else if cfg!(target_os = "macos") {
        Command::new("open")
    } else {
        Command::new("xdg-open")
    };
    command.arg(path).spawn().map_err(|error| {
        format!(
            "Could not open folder {} from the desktop app: {error}",
            path.display()
        )
    })?;
    Ok(())
}
