use serde::Serialize;
use std::{
    collections::HashSet,
    path::{Path, PathBuf},
    sync::Mutex,
};
use tauri::{Emitter, Manager, Runtime};

const OPEN_FILES_EVENT: &str = "app://open-files";

#[derive(Default)]
struct PendingOpenFiles(Mutex<Vec<String>>);

#[derive(Serialize, Clone)]
struct OpenFilesPayload {
    paths: Vec<String>,
}

#[tauri::command]
fn take_pending_open_files(state: tauri::State<'_, PendingOpenFiles>) -> Vec<String> {
    let mut pending = state.0.lock().expect("pending open files mutex poisoned");
    let files = pending.clone();
    pending.clear();
    files
}

fn focus_main_window<R: Runtime>(app: &tauri::AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

fn is_openable_text_file(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| matches!(ext.to_ascii_lowercase().as_str(), "md" | "markdown" | "txt"))
        .unwrap_or(false)
}

fn collect_open_file_paths(args: &[String], cwd: &Path) -> Vec<String> {
    let should_skip_first = args
        .first()
        .and_then(|arg| Path::new(arg).file_name())
        .and_then(|name| name.to_str())
        .map(|name| {
            name.eq_ignore_ascii_case("edit-md.exe") || name.eq_ignore_ascii_case("edit-md")
        })
        .unwrap_or(false);

    let mut seen = HashSet::new();

    args.iter()
        .skip(if should_skip_first { 1 } else { 0 })
        .filter(|arg| !arg.is_empty() && !arg.starts_with('-'))
        .filter_map(|arg| {
            let candidate = PathBuf::from(arg);
            let absolute = if candidate.is_absolute() {
                candidate
            } else {
                cwd.join(candidate)
            };
            if absolute.is_file() && is_openable_text_file(&absolute) {
                Some(absolute.to_string_lossy().into_owned())
            } else {
                None
            }
        })
        .filter(|path| seen.insert(path.clone()))
        .collect()
}

fn queue_open_files<R: Runtime>(app: &tauri::AppHandle<R>, paths: Vec<String>) {
    if paths.is_empty() {
        return;
    }

    if let Some(state) = app.try_state::<PendingOpenFiles>() {
        let mut pending = state.0.lock().expect("pending open files mutex poisoned");
        pending.extend(paths.iter().cloned());
    }

    if let Some(window) = app.get_webview_window("main") {
        let _ = window.emit(
            OPEN_FILES_EVENT,
            OpenFilesPayload {
                paths: paths.clone(),
            },
        );
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let startup_args: Vec<String> = std::env::args().collect();
    let startup_cwd = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));

    tauri::Builder::default()
        .manage(PendingOpenFiles::default())
        .invoke_handler(tauri::generate_handler![take_pending_open_files])
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            let cwd_path = PathBuf::from(cwd);
            let files = collect_open_file_paths(&args, &cwd_path);
            queue_open_files(app, files);
            focus_main_window(app);
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(move |app| {
            let files = collect_open_file_paths(&startup_args, &startup_cwd);
            queue_open_files(&app.handle(), files);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running edit-md");
}
