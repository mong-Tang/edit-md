use serde::Serialize;
use std::{
    collections::HashSet,
    path::{Path, PathBuf},
    sync::Mutex,
};
use tauri::{
    webview::PageLoadEvent, window::Color, Emitter, Manager, Runtime, WebviewUrl,
    WebviewWindowBuilder,
};

const MAIN_WINDOW_LABEL: &str = "main";
const OPEN_FILES_EVENT: &str = "app://open-files";
const SPLASH_WINDOW_LABEL: &str = "splashscreen";

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

#[tauri::command]
fn open_emoji_panel() {
    #[cfg(target_os = "windows")]
    {
        extern "system" {
            fn keybd_event(b_vk: u8, b_scan: u8, dw_flags: u32, dw_extra_info: usize);
        }
        unsafe {
            keybd_event(0x5B, 0, 0, 0); // LWin down
            keybd_event(0xBE, 0, 0, 0); // Period down
            keybd_event(0xBE, 0, 2, 0); // Period up
            keybd_event(0x5B, 0, 2, 0); // LWin up
        }
    }

    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        let _ = Command::new("osascript")
            .args(&["-e", "tell application \"System Events\" to keystroke \" \" using {control down, command down}"])
            .spawn();
    }
}

fn focus_main_window<R: Runtime>(app: &tauri::AppHandle<R>) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

fn show_main_window<R: Runtime>(app: &tauri::AppHandle<R>) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn close_splash_window<R: Runtime>(app: &tauri::AppHandle<R>) {
    if let Some(window) = app.get_webview_window(SPLASH_WINDOW_LABEL) {
        let _ = window.destroy();
    }
}

fn create_splash_window<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    if app.get_webview_window(SPLASH_WINDOW_LABEL).is_some() {
        return Ok(());
    }

    WebviewWindowBuilder::new(
        app,
        SPLASH_WINDOW_LABEL,
        WebviewUrl::App("splashscreen.html".into()),
    )
    .title("mongTang.md")
    .inner_size(520.0, 360.0)
    .visible(false)
    .resizable(false)
    .minimizable(false)
    .maximizable(false)
    .closable(false)
    .center()
    .focused(true)
    .always_on_top(true)
    .skip_taskbar(true)
    .background_color(Color(15, 23, 42, 255))
    .build()?;

    Ok(())
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

    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
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
        .on_page_load(|window, payload| {
            match (window.label(), payload.event()) {
                (SPLASH_WINDOW_LABEL, PageLoadEvent::Finished) => {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
                (MAIN_WINDOW_LABEL, PageLoadEvent::Finished) => {
                    let app = window.app_handle();
                    close_splash_window(&app);
                    show_main_window(&app);
                }
                _ => {
                    return;
                }
            }
        })
        .manage(PendingOpenFiles::default())
        .invoke_handler(tauri::generate_handler![take_pending_open_files, open_emoji_panel])
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
            #[cfg(desktop)]
            let _ = app.remove_menu();

            create_splash_window(&app.handle())?;
            let files = collect_open_file_paths(&startup_args, &startup_cwd);
            queue_open_files(&app.handle(), files);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running edit-md");
}
