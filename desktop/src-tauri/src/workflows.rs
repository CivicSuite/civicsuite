use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::local_paths;

#[derive(Deserialize, Serialize, Clone)]
pub struct AgendaItem {
    pub id: String,
    pub title: String,
    pub status: String,
    pub visibility: String,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct PublicComment {
    pub id: String,
    pub commenter_name: String,
    #[serde(default)]
    pub commenter_contact: String,
    #[serde(default)]
    pub mode: String,
    #[serde(default)]
    pub topic: String,
    pub body: String,
    pub status: String,
    #[serde(default)]
    pub redacted_body: String,
    #[serde(default)]
    pub redaction_basis: String,
    #[serde(default)]
    pub reviewed_at_unix_seconds: Option<u64>,
    #[serde(default)]
    pub redacted_at_unix_seconds: Option<u64>,
    pub submitted_at_unix_seconds: u64,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct NoticePosting {
    pub id: String,
    pub location: String,
    pub method: String,
    pub confirmation: String,
    #[serde(default)]
    pub posted_on: String,
    #[serde(default)]
    pub time_zone: String,
    #[serde(default)]
    pub checklist_id: String,
    pub posted_at_unix_seconds: u64,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct NoticeChecklist {
    pub id: String,
    pub meeting_type: String,
    pub statutory_basis: String,
    pub posting_deadline: String,
    pub time_zone: String,
    pub human_approval: bool,
    pub status: String,
    pub checked_at_unix_seconds: u64,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Meeting {
    pub id: String,
    pub title: String,
    pub meeting_date: String,
    pub status: String,
    pub notice_status: String,
    #[serde(default)]
    pub notice_checklists: Vec<NoticeChecklist>,
    #[serde(default)]
    pub notice_postings: Vec<NoticePosting>,
    pub summary: String,
    pub agenda_items: Vec<AgendaItem>,
    pub minutes: String,
    #[serde(default)]
    pub votes: Vec<String>,
    #[serde(default)]
    pub action_items: Vec<String>,
    #[serde(default)]
    pub resident_comments: Vec<String>,
    #[serde(default)]
    pub public_comments: Vec<PublicComment>,
    #[serde(default)]
    pub exports: Vec<String>,
    #[serde(default)]
    pub minutes_adopted_at_unix_seconds: Option<u64>,
    #[serde(default)]
    pub archived_at_unix_seconds: Option<u64>,
    pub created_at_unix_seconds: u64,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct RecordsTimelineEntry {
    pub id: String,
    pub action: String,
    pub actor: String,
    pub note: String,
    pub created_at_unix_seconds: u64,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct RecordsRequest {
    pub id: String,
    #[serde(default)]
    pub public_tracking_number: String,
    pub requester: String,
    #[serde(default)]
    pub requester_contact: String,
    #[serde(default)]
    pub submitted_via: String,
    pub summary: String,
    pub deadline: String,
    #[serde(default)]
    pub deadline_basis: String,
    pub status: String,
    #[serde(default)]
    pub assigned_to: String,
    #[serde(default)]
    pub clarification_notes: Vec<String>,
    #[serde(default)]
    pub search_notes: Vec<String>,
    #[serde(default)]
    pub exemption_reviews: Vec<String>,
    #[serde(default)]
    pub fee_estimate: String,
    #[serde(default)]
    pub citations: Vec<String>,
    #[serde(default)]
    pub response_draft: String,
    #[serde(default)]
    pub approval_notes: Vec<String>,
    #[serde(default)]
    pub exports: Vec<String>,
    #[serde(default)]
    pub timeline: Vec<RecordsTimelineEntry>,
    #[serde(default)]
    pub deadline_reviewed_at_unix_seconds: Option<u64>,
    #[serde(default)]
    pub approved_at_unix_seconds: Option<u64>,
    #[serde(default)]
    pub fulfilled_at_unix_seconds: Option<u64>,
    #[serde(default)]
    pub closed_at_unix_seconds: Option<u64>,
    pub created_at_unix_seconds: u64,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct CodeVersionEntry {
    pub id: String,
    pub label: String,
    pub source: String,
    pub authoritative_url: String,
    pub note: String,
    pub status: String,
    pub recorded_at_unix_seconds: u64,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct CodeSource {
    pub id: String,
    pub title: String,
    pub citation: String,
    pub body: String,
    pub status: String,
    #[serde(default)]
    pub codifier_name: String,
    #[serde(default)]
    pub authoritative_url: String,
    #[serde(default)]
    pub version_label: String,
    #[serde(default = "default_code_sync_status")]
    pub codifier_sync_status: String,
    #[serde(default)]
    pub codifier_sync_errors: Vec<String>,
    #[serde(default)]
    pub last_codifier_sync_at_unix_seconds: Option<u64>,
    #[serde(default)]
    pub stale_since_unix_seconds: Option<u64>,
    #[serde(default)]
    pub amendment_notes: Vec<String>,
    #[serde(default)]
    pub version_history: Vec<CodeVersionEntry>,
    #[serde(default)]
    pub staff_guidance: String,
    #[serde(default)]
    pub plain_language_summary: String,
    #[serde(default)]
    pub guidance_approved_at_unix_seconds: Option<u64>,
    #[serde(default = "default_code_public_status")]
    pub public_status: String,
    #[serde(default)]
    pub public_exports: Vec<String>,
    #[serde(default)]
    pub published_at_unix_seconds: Option<u64>,
    pub created_at_unix_seconds: u64,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct CodeHandoff {
    pub id: String,
    pub source_id: String,
    pub title: String,
    pub summary: String,
    pub status: String,
    pub created_at_unix_seconds: u64,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct AuditEntry {
    pub id: String,
    pub module_id: String,
    pub action: String,
    pub summary: String,
    pub created_at_unix_seconds: u64,
    #[serde(default)]
    pub previous_hash: String,
    #[serde(default)]
    pub entry_hash: String,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct PublicationEvent {
    pub id: String,
    pub source_module: String,
    pub source_record_id: String,
    pub record_type: String,
    pub public_payload: String,
    pub payload_hash: String,
    pub published_at_unix_seconds: u64,
    #[serde(default)]
    pub retracted_at_unix_seconds: Option<u64>,
    #[serde(default)]
    pub retracted_by: String,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct NotificationEvent {
    pub id: String,
    pub module_id: String,
    pub record_id: String,
    pub audience: String,
    pub channel: String,
    pub subject: String,
    pub body: String,
    pub status: String,
    pub created_at_unix_seconds: u64,
    #[serde(default)]
    pub sent_at_unix_seconds: Option<u64>,
}

#[derive(Deserialize, Serialize)]
struct ExportIntegrityManifest {
    schema_version: u16,
    export_file: String,
    export_path: String,
    format: String,
    size_bytes: u64,
    sha256: String,
    created_at_unix_seconds: u64,
    generated_by: String,
}

#[derive(Serialize, Clone)]
pub struct SearchResult {
    pub module_id: String,
    pub record_id: String,
    pub title: String,
    pub snippet: String,
    pub citation: String,
    pub status: String,
}

#[derive(Deserialize, Serialize, Clone, Default)]
pub struct CityWorkState {
    pub meetings: Vec<Meeting>,
    pub records_requests: Vec<RecordsRequest>,
    pub code_sources: Vec<CodeSource>,
    pub code_handoffs: Vec<CodeHandoff>,
    pub audit_entries: Vec<AuditEntry>,
    #[serde(default)]
    pub publication_events: Vec<PublicationEvent>,
    #[serde(default)]
    pub notification_events: Vec<NotificationEvent>,
}

#[derive(Serialize)]
pub struct CityWorkActionResult {
    pub accepted: bool,
    pub action: String,
    pub status: &'static str,
    pub message: String,
    pub next_action: String,
    pub state: CityWorkState,
    pub search_results: Vec<SearchResult>,
}

fn workflows_path() -> PathBuf {
    local_paths::data_root()
        .join("workflows")
        .join("city-work.json")
}

fn exports_dir() -> PathBuf {
    local_paths::data_root().join("exports")
}

fn now_unix_seconds() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or(0)
}

fn new_id(prefix: &str, count: usize) -> String {
    format!("{prefix}-{}-{}", now_unix_seconds(), count + 1)
}

fn records_tracking_number(count: usize) -> String {
    format!("REQ-{:04}", count + 1)
}

fn default_code_public_status() -> String {
    "internal draft".to_string()
}

fn default_code_sync_status() -> String {
    "not synced".to_string()
}

fn read_state() -> Result<CityWorkState, String> {
    let path = workflows_path();
    if !path.is_file() {
        return Ok(CityWorkState::default());
    }
    let contents = fs::read_to_string(&path)
        .map_err(|error| format!("Could not read local workflow state: {error}"))?;
    serde_json::from_str(&contents)
        .map_err(|error| format!("Could not parse local workflow state: {error}"))
}

fn write_state(state: &CityWorkState) -> Result<(), String> {
    let path = workflows_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Could not create {}: {error}", parent.display()))?;
    }
    let contents = serde_json::to_string_pretty(state)
        .map_err(|error| format!("Could not serialize local workflow state: {error}"))?;
    fs::write(&path, format!("{contents}\n"))
        .map_err(|error| format!("Could not write {}: {error}", path.display()))
}

fn safe_file_stem(value: &str) -> String {
    let stem: String = value
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() {
                character.to_ascii_lowercase()
            } else {
                '-'
            }
        })
        .collect();
    stem.split('-')
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

fn export_manifest_path(export_path: &Path) -> PathBuf {
    let export_file = export_path
        .file_name()
        .map(|value| value.to_string_lossy().to_string())
        .unwrap_or_else(|| "export.md".to_string());
    export_path.with_file_name(format!("{export_file}.sha256.json"))
}

fn write_export_integrity_manifest(
    export_path: &Path,
    contents: &str,
    created_at_unix_seconds: u64,
) -> Result<(), String> {
    let export_file = export_path
        .file_name()
        .map(|value| value.to_string_lossy().to_string())
        .unwrap_or_else(|| "export.md".to_string());
    let manifest = ExportIntegrityManifest {
        schema_version: 1,
        export_file,
        export_path: export_path.to_string_lossy().to_string(),
        format: "markdown".to_string(),
        size_bytes: contents.len() as u64,
        sha256: hash_public_payload(contents),
        created_at_unix_seconds,
        generated_by: "CivicSuite Windows Local".to_string(),
    };
    let manifest_path = export_manifest_path(export_path);
    let manifest_contents = serde_json::to_string_pretty(&manifest)
        .map_err(|error| format!("Could not serialize export integrity manifest: {error}"))?;
    fs::write(&manifest_path, format!("{manifest_contents}\n")).map_err(|error| {
        format!(
            "Could not write export integrity manifest {}: {error}",
            manifest_path.display()
        )
    })
}

fn write_export_file(folder: &str, stem: &str, contents: &str) -> Result<String, String> {
    let directory = exports_dir().join(folder);
    fs::create_dir_all(&directory)
        .map_err(|error| format!("Could not create export folder: {error}"))?;
    let safe_stem = safe_file_stem(stem);
    let timestamp = now_unix_seconds();
    let mut path = directory.join(format!("{safe_stem}-{timestamp}.md"));
    let mut suffix = 2;
    while path.exists() {
        path = directory.join(format!("{safe_stem}-{timestamp}-{suffix}.md"));
        suffix += 1;
    }
    fs::write(&path, contents)
        .map_err(|error| format!("Could not write export {}: {error}", path.display()))?;
    if let Err(error) = write_export_integrity_manifest(&path, contents, timestamp) {
        let _ = fs::remove_file(&path);
        return Err(error);
    }
    Ok(path.to_string_lossy().to_string())
}

fn payload_string(payload: Option<&Value>, key: &str) -> Result<String, String> {
    payload
        .and_then(|value| value.get(key))
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string)
        .ok_or_else(|| format!("Missing required workflow field: {key}"))
}

fn payload_optional_string(payload: Option<&Value>, key: &str) -> String {
    payload
        .and_then(|value| value.get(key))
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string)
        .unwrap_or_default()
}

fn payload_bool(payload: Option<&Value>, key: &str) -> bool {
    payload
        .and_then(|value| value.get(key))
        .and_then(Value::as_bool)
        .unwrap_or(false)
}

fn days_in_month(year: u32, month: u32) -> u32 {
    match month {
        1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
        4 | 6 | 9 | 11 => 30,
        2 if (year % 4 == 0 && year % 100 != 0) || year % 400 == 0 => 29,
        2 => 28,
        _ => 0,
    }
}

fn parse_iso_date(value: &str, label: &str) -> Result<(u32, u32, u32), String> {
    let parts = value.split('-').collect::<Vec<_>>();
    if parts.len() != 3
        || parts[0].len() != 4
        || parts[1].len() != 2
        || parts[2].len() != 2
        || parts
            .iter()
            .any(|part| !part.chars().all(|character| character.is_ascii_digit()))
    {
        return Err(format!("Enter {label} as YYYY-MM-DD."));
    }
    let year = parts[0]
        .parse::<u32>()
        .map_err(|_| format!("Enter {label} as YYYY-MM-DD."))?;
    let month = parts[1]
        .parse::<u32>()
        .map_err(|_| format!("Enter {label} as YYYY-MM-DD."))?;
    let day = parts[2]
        .parse::<u32>()
        .map_err(|_| format!("Enter {label} as YYYY-MM-DD."))?;
    let max_day = days_in_month(year, month);
    if !(1900..=9999).contains(&year) || max_day == 0 || day == 0 || day > max_day {
        return Err(format!("Enter {label} as a real calendar date."));
    }
    Ok((year, month, day))
}

fn iso_date_after(
    left: &str,
    right: &str,
    left_label: &str,
    right_label: &str,
) -> Result<bool, String> {
    Ok(parse_iso_date(left, left_label)? > parse_iso_date(right, right_label)?)
}

fn ensure_notice_time_zone(time_zone: &str) -> Result<(), String> {
    const SUPPORTED_TIME_ZONES: &[&str] = &[
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Phoenix",
        "America/Los_Angeles",
        "America/Anchorage",
        "Pacific/Honolulu",
        "America/Puerto_Rico",
        "UTC",
    ];
    if SUPPORTED_TIME_ZONES.contains(&time_zone) {
        return Ok(());
    }
    Err("Choose a valid IANA time zone, such as America/Denver.".to_string())
}

fn latest_notice_checklist(meeting: &Meeting) -> Option<&NoticeChecklist> {
    meeting.notice_checklists.last()
}

fn bytes_to_hex(bytes: &[u8]) -> String {
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}

fn audit_entry_hash(
    previous_hash: &str,
    id: &str,
    module_id: &str,
    action: &str,
    summary: &str,
    created_at_unix_seconds: u64,
) -> String {
    let mut hasher = Sha256::new();
    hasher.update(previous_hash.as_bytes());
    hasher.update(b"\n");
    hasher.update(id.as_bytes());
    hasher.update(b"\n");
    hasher.update(module_id.as_bytes());
    hasher.update(b"\n");
    hasher.update(action.as_bytes());
    hasher.update(b"\n");
    hasher.update(summary.as_bytes());
    hasher.update(b"\n");
    hasher.update(created_at_unix_seconds.to_string().as_bytes());
    bytes_to_hex(&hasher.finalize())
}

fn push_audit(state: &mut CityWorkState, module_id: &str, action: &str, summary: String) {
    let id = new_id("audit", state.audit_entries.len());
    let created_at_unix_seconds = now_unix_seconds();
    let previous_hash = state
        .audit_entries
        .last()
        .map(|entry| entry.entry_hash.clone())
        .filter(|hash| !hash.is_empty())
        .unwrap_or_else(|| "GENESIS".to_string());
    let entry_hash = audit_entry_hash(
        &previous_hash,
        &id,
        module_id,
        action,
        &summary,
        created_at_unix_seconds,
    );
    state.audit_entries.push(AuditEntry {
        id,
        module_id: module_id.to_string(),
        action: action.to_string(),
        summary,
        created_at_unix_seconds,
        previous_hash,
        entry_hash,
    });
}

fn hash_public_payload(payload: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(payload.as_bytes());
    bytes_to_hex(&hasher.finalize())
}

fn push_publication_event(
    state: &mut CityWorkState,
    source_module: &str,
    source_record_id: String,
    record_type: &str,
    public_payload: String,
) {
    let id = new_id("publication", state.publication_events.len());
    let payload_hash = hash_public_payload(&public_payload);
    state.publication_events.push(PublicationEvent {
        id,
        source_module: source_module.to_string(),
        source_record_id,
        record_type: record_type.to_string(),
        public_payload,
        payload_hash,
        published_at_unix_seconds: now_unix_seconds(),
        retracted_at_unix_seconds: None,
        retracted_by: String::new(),
    });
}

fn push_notification_event(
    state: &mut CityWorkState,
    module_id: &str,
    record_id: String,
    audience: &str,
    subject: String,
    body: String,
) {
    let id = new_id("notification", state.notification_events.len());
    state.notification_events.insert(
        0,
        NotificationEvent {
            id,
            module_id: module_id.to_string(),
            record_id,
            audience: audience.to_string(),
            channel: "local notification outbox".to_string(),
            subject,
            body,
            status: "ready to send".to_string(),
            created_at_unix_seconds: now_unix_seconds(),
            sent_at_unix_seconds: None,
        },
    );
}

fn retract_publication_event(
    state: &mut CityWorkState,
    source_module: &str,
    source_record_id: &str,
    retracted_by: &str,
) {
    if let Some(event) = state.publication_events.iter_mut().rev().find(|event| {
        event.source_module == source_module
            && event.source_record_id == source_record_id
            && event.retracted_at_unix_seconds.is_none()
    }) {
        event.retracted_at_unix_seconds = Some(now_unix_seconds());
        event.retracted_by = retracted_by.to_string();
    }
}

fn selected_meeting_index(state: &CityWorkState, payload: Option<&Value>) -> Result<usize, String> {
    let meeting_id = payload_optional_string(payload, "meetingId");
    if meeting_id.is_empty() {
        if state.meetings.is_empty() {
            return Err("Create a meeting before recording this clerk action.".to_string());
        }
        return Ok(0);
    }
    state
        .meetings
        .iter()
        .position(|meeting| meeting.id == meeting_id)
        .ok_or_else(|| "The selected meeting was not found in the local city profile.".to_string())
}

fn selected_meeting_mut<'a>(
    state: &'a mut CityWorkState,
    payload: Option<&Value>,
) -> Result<&'a mut Meeting, String> {
    let index = selected_meeting_index(state, payload)?;
    Ok(&mut state.meetings[index])
}

fn ensure_meeting_can_change(meeting: &Meeting) -> Result<(), String> {
    if meeting.archived_at_unix_seconds.is_some() || meeting.status == "archived public record" {
        return Err(
            "This meeting is archived as a public record. Create a new meeting for new clerk work."
                .to_string(),
        );
    }
    Ok(())
}

fn selected_record_index(state: &CityWorkState, payload: Option<&Value>) -> Result<usize, String> {
    let request_id = payload_optional_string(payload, "recordsRequestId");
    if request_id.is_empty() {
        if state.records_requests.is_empty() {
            return Err(
                "Create a records request before drafting or exporting a response.".to_string(),
            );
        }
        return Ok(0);
    }
    state
        .records_requests
        .iter()
        .position(|request| request.id == request_id)
        .ok_or_else(|| {
            "The selected records request was not found in the local city profile.".to_string()
        })
}

fn selected_record_mut<'a>(
    state: &'a mut CityWorkState,
    payload: Option<&Value>,
) -> Result<&'a mut RecordsRequest, String> {
    let index = selected_record_index(state, payload)?;
    Ok(&mut state.records_requests[index])
}

fn selected_notification_mut<'a>(
    state: &'a mut CityWorkState,
    payload: Option<&Value>,
) -> Result<&'a mut NotificationEvent, String> {
    let notification_id = payload_optional_string(payload, "notificationId");
    if notification_id.is_empty() {
        return state
            .notification_events
            .iter_mut()
            .find(|event| event.status == "ready to send")
            .ok_or_else(|| {
                "No ready local notification exists yet. Create or select a notification first."
                    .to_string()
            });
    }
    state
        .notification_events
        .iter_mut()
        .find(|event| event.id == notification_id)
        .ok_or_else(|| "The selected local notification could not be found.".to_string())
}

fn ensure_records_request_active(request: &RecordsRequest) -> Result<(), String> {
    if request.closed_at_unix_seconds.is_some() || request.status == "closed" {
        return Err(
            "This records request is closed. Create a new request for new records work."
                .to_string(),
        );
    }
    if request.fulfilled_at_unix_seconds.is_some() || request.status == "fulfilled" {
        return Err(
            "This records request has already been fulfilled. Close it or create a new request."
                .to_string(),
        );
    }
    Ok(())
}

fn first_pending_code_handoff_index(state: &CityWorkState) -> Result<usize, String> {
    state
        .code_handoffs
        .iter()
        .position(|handoff| handoff.status != "sent to clerk agenda")
        .ok_or_else(|| "Create a code handoff before adding it to a clerk agenda.".to_string())
}

fn selected_pending_code_handoff_index(
    state: &CityWorkState,
    payload: Option<&Value>,
) -> Result<usize, String> {
    let handoff_id = payload_optional_string(payload, "codeHandoffId");
    if handoff_id.is_empty() {
        return first_pending_code_handoff_index(state);
    }
    let index = state
        .code_handoffs
        .iter()
        .position(|handoff| handoff.id == handoff_id)
        .ok_or_else(|| {
            "The selected code handoff was not found in the local city profile.".to_string()
        })?;
    if state.code_handoffs[index].status == "sent to clerk agenda" {
        return Err("The selected code handoff has already been sent to an agenda.".to_string());
    }
    Ok(index)
}

fn create_meeting(state: &mut CityWorkState, payload: Option<&Value>) -> Result<String, String> {
    let title = payload_string(payload, "title")?;
    let meeting_date = payload_string(payload, "meetingDate")?;
    let summary = payload_optional_string(payload, "summary");
    let agenda_title = payload_optional_string(payload, "agendaTitle");
    let id = new_id("meeting", state.meetings.len());
    let mut meeting = Meeting {
        id: id.clone(),
        title: title.clone(),
        meeting_date,
        status: "draft".to_string(),
        notice_status: "not posted".to_string(),
        notice_checklists: Vec::new(),
        notice_postings: Vec::new(),
        summary,
        agenda_items: Vec::new(),
        minutes: String::new(),
        votes: Vec::new(),
        action_items: Vec::new(),
        resident_comments: Vec::new(),
        public_comments: Vec::new(),
        exports: Vec::new(),
        minutes_adopted_at_unix_seconds: None,
        archived_at_unix_seconds: None,
        created_at_unix_seconds: now_unix_seconds(),
    };
    if !agenda_title.is_empty() {
        meeting.agenda_items.push(AgendaItem {
            id: new_id("agenda", 0),
            title: agenda_title,
            status: "draft".to_string(),
            visibility: "public draft".to_string(),
        });
    }
    state.meetings.insert(0, meeting);
    push_audit(
        state,
        "civicclerk",
        "create-meeting",
        format!("Created meeting draft: {title}"),
    );
    Ok("Meeting draft saved locally with agenda and notice status.".to_string())
}

fn add_agenda_item(state: &mut CityWorkState, payload: Option<&Value>) -> Result<String, String> {
    let title = payload_string(payload, "agendaTitle")?;
    let meeting_index = selected_meeting_index(state, payload)?;
    let agenda_count = {
        let meeting = &state.meetings[meeting_index];
        ensure_meeting_can_change(meeting)?;
        meeting.agenda_items.len()
    };
    let meeting = &mut state.meetings[meeting_index];
    meeting.agenda_items.push(AgendaItem {
        id: new_id("agenda", agenda_count),
        title: title.clone(),
        status: "draft".to_string(),
        visibility: "public draft".to_string(),
    });
    meeting.status = "agenda drafting".to_string();
    push_audit(
        state,
        "civicclerk",
        "add-agenda-item",
        format!("Added agenda item: {title}"),
    );
    Ok("Agenda item added to the current meeting draft.".to_string())
}

fn add_code_handoff_agenda(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    if state.meetings.is_empty() {
        return Err("Create a meeting before adding a code handoff to the agenda.".to_string());
    }
    let meeting_index = selected_meeting_index(state, payload)?;
    let handoff_index = selected_pending_code_handoff_index(state, payload)?;
    let handoff_title = state.code_handoffs[handoff_index].title.clone();
    let handoff_summary = state.code_handoffs[handoff_index].summary.clone();
    let agenda_count = state.meetings[meeting_index].agenda_items.len();
    let agenda_title = format!("Code review: {handoff_title}");
    let meeting = &mut state.meetings[meeting_index];
    ensure_meeting_can_change(meeting)?;
    meeting.agenda_items.push(AgendaItem {
        id: new_id("agenda", agenda_count),
        title: agenda_title,
        status: "draft".to_string(),
        visibility: "staff draft".to_string(),
    });
    meeting.status = "agenda drafting".to_string();
    state.code_handoffs[handoff_index].status = "sent to clerk agenda".to_string();
    push_audit(
        state,
        "civicclerk",
        "add-code-handoff-agenda",
        format!("Code handoff added to agenda: {handoff_title}. {handoff_summary}"),
    );
    Ok(format!(
        "Code handoff added to the current meeting agenda: {handoff_title}."
    ))
}

fn complete_notice_checklist(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let meeting_type = payload_string(payload, "noticeMeetingType")
        .map_err(|_| "Enter the meeting type for the notice checklist.".to_string())?;
    let statutory_basis = payload_string(payload, "noticeStatutoryBasis")
        .map_err(|_| "Enter the statutory notice basis before posting notice.".to_string())?;
    let posting_deadline = payload_string(payload, "noticeDeadline")
        .map_err(|_| "Enter the notice posting deadline as YYYY-MM-DD.".to_string())?;
    let time_zone = payload_string(payload, "noticeTimeZone")
        .map_err(|_| "Enter the notice time zone, such as America/Denver.".to_string())?;
    ensure_notice_time_zone(&time_zone)?;
    parse_iso_date(&posting_deadline, "notice posting deadline")?;
    let human_approval = payload_bool(payload, "noticeHumanApproval");
    if !human_approval {
        return Err("A clerk must approve the notice checklist before posting notice.".to_string());
    }

    let meeting = selected_meeting_mut(state, payload)?;
    ensure_meeting_can_change(meeting)?;
    parse_iso_date(&meeting.meeting_date, "meeting date")?;
    if meeting.agenda_items.is_empty() {
        return Err(
            "Add at least one agenda item before approving the notice checklist.".to_string(),
        );
    }
    if iso_date_after(
        &posting_deadline,
        &meeting.meeting_date,
        "notice posting deadline",
        "meeting date",
    )? {
        return Err("Notice deadline must be on or before the meeting date.".to_string());
    }

    let checklist_id = new_id("notice-checklist", meeting.notice_checklists.len());
    meeting.notice_checklists.push(NoticeChecklist {
        id: checklist_id,
        meeting_type: meeting_type.clone(),
        statutory_basis: statutory_basis.clone(),
        posting_deadline: posting_deadline.clone(),
        time_zone: time_zone.clone(),
        human_approval,
        status: "ready for posting".to_string(),
        checked_at_unix_seconds: now_unix_seconds(),
    });
    let title = meeting.title.clone();
    meeting.notice_status = "notice checklist ready".to_string();
    meeting.status = "notice checklist ready".to_string();
    push_audit(
        state,
        "civicclerk",
        "complete-notice-checklist",
        format!(
            "Notice checklist approved for {title}; type: {meeting_type}; basis: {statutory_basis}; deadline: {posting_deadline}; time zone: {time_zone}"
        ),
    );
    Ok("Notice checklist approved locally. Posting proof can now be recorded.".to_string())
}

fn post_notice(state: &mut CityWorkState, payload: Option<&Value>) -> Result<String, String> {
    let posting_location = payload_string(payload, "postingLocation").map_err(|_| {
        "Enter the notice posting location before marking notice ready.".to_string()
    })?;
    let posting_method = payload_string(payload, "postingMethod")
        .map_err(|_| "Enter the notice posting method before marking notice ready.".to_string())?;
    let posting_confirmation = payload_string(payload, "postingConfirmation").map_err(|_| {
        "Enter the notice posting confirmation before marking notice ready.".to_string()
    })?;
    let posting_date = payload_string(payload, "postingDate")
        .map_err(|_| "Enter the actual notice posting date as YYYY-MM-DD.".to_string())?;
    parse_iso_date(&posting_date, "actual notice posting date")?;
    let meeting = selected_meeting_mut(state, payload)?;
    ensure_meeting_can_change(meeting)?;
    if meeting.agenda_items.is_empty() {
        return Err("Add at least one agenda item before posting notice.".to_string());
    }
    let checklist = latest_notice_checklist(meeting)
        .cloned()
        .ok_or_else(|| "Complete the notice checklist before marking notice ready.".to_string())?;
    if checklist.status != "ready for posting" || !checklist.human_approval {
        return Err("A clerk must approve the notice checklist before posting notice.".to_string());
    }
    if iso_date_after(
        &posting_date,
        &checklist.posting_deadline,
        "actual notice posting date",
        "notice posting deadline",
    )? {
        return Err(
            "The posting date is after the notice checklist deadline; update the checklist before marking notice ready."
                .to_string(),
        );
    }
    let notice_id = new_id("notice", meeting.notice_postings.len());
    meeting.notice_postings.push(NoticePosting {
        id: notice_id,
        location: posting_location.clone(),
        method: posting_method.clone(),
        confirmation: posting_confirmation.clone(),
        posted_on: posting_date.clone(),
        time_zone: checklist.time_zone.clone(),
        checklist_id: checklist.id.clone(),
        posted_at_unix_seconds: now_unix_seconds(),
    });
    let title = meeting.title.clone();
    meeting.notice_status = "public notice ready".to_string();
    meeting.status = "notice ready".to_string();
    push_audit(
        state,
        "civicclerk",
        "post-notice",
        format!(
            "Prepared public notice for {title}; posted at {posting_location} by {posting_method} on {posting_date} {}; confirmation: {posting_confirmation}",
            checklist.time_zone
        ),
    );
    Ok("Notice marked ready with posting evidence preserved locally.".to_string())
}

fn record_minutes(state: &mut CityWorkState, payload: Option<&Value>) -> Result<String, String> {
    let minutes = payload_string(payload, "minutes")?;
    let meeting = selected_meeting_mut(state, payload)?;
    ensure_meeting_can_change(meeting)?;
    let title = meeting.title.clone();
    meeting.minutes = minutes;
    meeting.status = "minutes drafted".to_string();
    push_audit(
        state,
        "civicclerk",
        "record-minutes",
        format!("Drafted minutes for: {title}"),
    );
    Ok("Minutes draft saved locally and tied to the meeting audit trail.".to_string())
}

fn suggest_minutes_draft(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let meeting = selected_meeting_mut(state, payload)?;
    ensure_meeting_can_change(meeting)?;
    if meeting.minutes_adopted_at_unix_seconds.is_some() {
        return Err(
            "Minutes are already adopted. Create a correction record before drafting new minutes."
                .to_string(),
        );
    }
    let public_comments = if meeting.public_comments.is_empty() {
        "No public comments submitted.".to_string()
    } else {
        meeting
            .public_comments
            .iter()
            .map(|comment| {
                let body = if comment.status == "redacted for public record"
                    && !comment.redacted_body.is_empty()
                {
                    format!(
                        "{} (Redaction basis: {})",
                        comment.redacted_body, comment.redaction_basis
                    )
                } else {
                    comment.body.clone()
                };
                format!(
                    "- {} [{} / {}]: {}",
                    comment.commenter_name, comment.mode, comment.status, body
                )
            })
            .collect::<Vec<_>>()
            .join("\n")
    };
    let agenda = if meeting.agenda_items.is_empty() {
        "No agenda items recorded.".to_string()
    } else {
        meeting
            .agenda_items
            .iter()
            .map(|item| format!("- {} [{} / {}]", item.title, item.status, item.visibility))
            .collect::<Vec<_>>()
            .join("\n")
    };
    let has_meeting_evidence = !meeting.summary.trim().is_empty()
        || !meeting.agenda_items.is_empty()
        || !meeting.votes.is_empty()
        || !meeting.action_items.is_empty()
        || !meeting.resident_comments.is_empty()
        || !meeting.public_comments.is_empty();
    if !has_meeting_evidence {
        return Err("Add a summary, agenda item, outcome, action item, or comment before generating a local AI minutes draft.".to_string());
    }
    let prompt = format!(
        "Draft internal city meeting minutes for clerk review. Use only the facts below. Do not mark the minutes adopted, official, or publicly archived. Do not invent votes, speakers, attendees, or actions. Include clear sections for agenda, notice checklist, notice evidence, outcomes, action items, and comments when present.\n\nMeeting title: {}\nDate: {}\nStatus: {}\nNotice status: {}\nNotice checklist:\n{}\nNotice posting evidence:\n{}\nSummary: {}\nAgenda:\n{}\nExisting minutes draft: {}\nRecorded outcomes:\n{}\nAction items:\n{}\nStaff-entered resident comments:\n{}\nPublic comments:\n{}\n",
        meeting.title,
        meeting.meeting_date,
        meeting.status,
        meeting.notice_status,
        notice_checklists_or_default(&meeting.notice_checklists),
        notice_postings_or_default(&meeting.notice_postings),
        if meeting.summary.is_empty() {
            "No summary recorded."
        } else {
            &meeting.summary
        },
        agenda,
        if meeting.minutes.is_empty() {
            "No existing minutes draft recorded."
        } else {
            &meeting.minutes
        },
        list_or_default(&meeting.votes, "No outcomes recorded."),
        list_or_default(&meeting.action_items, "No action items recorded."),
        list_or_default(&meeting.resident_comments, "No resident comments recorded."),
        public_comments
    );
    let title = meeting.title.clone();
    let (runtime_model, generated) = crate::model::generate_local_text(&prompt)?;
    meeting.minutes = generated;
    meeting.status = "local AI minutes draft ready for review".to_string();
    push_audit(
        state,
        "civicclerk",
        "suggest-minutes-draft",
        format!("Generated local AI minutes draft for {title} with {runtime_model}; adoption still requires human review."),
    );
    Ok(
        "Local AI minutes draft generated. Review, edit, and adopt minutes before archive."
            .to_string(),
    )
}

fn record_vote(state: &mut CityWorkState, payload: Option<&Value>) -> Result<String, String> {
    let vote = payload_string(payload, "vote")?;
    let meeting = selected_meeting_mut(state, payload)?;
    ensure_meeting_can_change(meeting)?;
    meeting.votes.push(vote.clone());
    meeting.status = "outcomes recorded".to_string();
    push_audit(
        state,
        "civicclerk",
        "record-vote",
        format!("Recorded vote/outcome: {vote}"),
    );
    Ok("Vote or action outcome saved locally.".to_string())
}

fn add_action_item(state: &mut CityWorkState, payload: Option<&Value>) -> Result<String, String> {
    let action_item = payload_string(payload, "actionItem")?;
    let meeting = selected_meeting_mut(state, payload)?;
    ensure_meeting_can_change(meeting)?;
    meeting.action_items.push(action_item.clone());
    meeting.status = "action items recorded".to_string();
    push_audit(
        state,
        "civicclerk",
        "add-action-item",
        format!("Recorded action item: {action_item}"),
    );
    Ok("Action item added to the meeting record.".to_string())
}

fn record_resident_comment(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let resident_comment = payload_string(payload, "residentComment")?;
    let meeting = selected_meeting_mut(state, payload)?;
    ensure_meeting_can_change(meeting)?;
    meeting.resident_comments.push(resident_comment.clone());
    meeting.status = "resident comments recorded".to_string();
    push_audit(
        state,
        "civicclerk",
        "record-resident-comment",
        "Logged resident comment for meeting record.".to_string(),
    );
    Ok("Resident comment saved to the meeting record.".to_string())
}

fn submit_public_comment(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let meeting_id = payload_string(payload, "meetingId")?;
    let commenter_name = payload_string(payload, "commenterName")?;
    let commenter_contact = payload_optional_string(payload, "commenterContact");
    let mode = payload_optional_string(payload, "commentMode");
    let topic = payload_optional_string(payload, "commentTopic");
    let body = payload_string(payload, "commentBody")?;
    let meeting = state
        .meetings
        .iter_mut()
        .find(|meeting| meeting.id == meeting_id)
        .ok_or_else(|| "Select a posted public meeting before submitting comment.".to_string())?;
    if meeting.archived_at_unix_seconds.is_some() || meeting.status == "archived public record" {
        return Err("This meeting is archived. Public comments are closed.".to_string());
    }
    if meeting.notice_status != "public notice ready" {
        return Err("Public comments open only after the meeting notice is posted.".to_string());
    }
    let comment_id = new_id("comment", meeting.public_comments.len());
    meeting.public_comments.push(PublicComment {
        id: comment_id.clone(),
        commenter_name: commenter_name.clone(),
        commenter_contact,
        mode: if mode.is_empty() {
            "written".to_string()
        } else {
            mode
        },
        topic: if topic.is_empty() {
            "General public comment".to_string()
        } else {
            topic
        },
        body,
        status: "received for clerk review".to_string(),
        redacted_body: String::new(),
        redaction_basis: String::new(),
        reviewed_at_unix_seconds: None,
        redacted_at_unix_seconds: None,
        submitted_at_unix_seconds: now_unix_seconds(),
    });
    meeting.status = "public comments received".to_string();
    push_audit(
        state,
        "civicclerk",
        "submit-public-comment",
        format!("Received public comment {comment_id} from: {commenter_name}"),
    );
    Ok(format!(
        "Public comment {comment_id} saved for clerk review and packet/archive preservation."
    ))
}

fn selected_public_comment_indexes(
    state: &CityWorkState,
    payload: Option<&Value>,
) -> Result<(usize, usize), String> {
    let meeting_index = selected_meeting_index(state, payload)?;
    let comment_id = payload_optional_string(payload, "publicCommentId");
    let meeting = &state.meetings[meeting_index];
    if meeting.public_comments.is_empty() {
        return Err("Select a submitted public comment before review.".to_string());
    }
    let comment_index = if comment_id.is_empty() {
        meeting
            .public_comments
            .iter()
            .position(|comment| comment.status == "received for clerk review")
            .unwrap_or(0)
    } else {
        meeting
            .public_comments
            .iter()
            .position(|comment| comment.id == comment_id)
            .ok_or_else(|| "Selected public comment was not found for this meeting.".to_string())?
    };
    Ok((meeting_index, comment_index))
}

fn review_public_comment(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let (meeting_index, comment_index) = selected_public_comment_indexes(state, payload)?;
    let meeting = &mut state.meetings[meeting_index];
    ensure_meeting_can_change(meeting)?;
    let comment = &mut meeting.public_comments[comment_index];
    comment.status = "reviewed for public record".to_string();
    comment.reviewed_at_unix_seconds = Some(now_unix_seconds());
    let comment_id = comment.id.clone();
    let commenter_name = comment.commenter_name.clone();
    push_audit(
        state,
        "civicclerk",
        "review-public-comment",
        format!("Reviewed public comment {comment_id} from: {commenter_name}"),
    );
    Ok(format!(
        "Public comment {comment_id} marked reviewed for the public record."
    ))
}

fn redact_public_comment(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let redacted_body = payload_string(payload, "redactedBody")?;
    let redaction_basis = payload_string(payload, "redactionBasis")?;
    let (meeting_index, comment_index) = selected_public_comment_indexes(state, payload)?;
    let meeting = &mut state.meetings[meeting_index];
    ensure_meeting_can_change(meeting)?;
    let comment = &mut meeting.public_comments[comment_index];
    comment.status = "redacted for public record".to_string();
    comment.redacted_body = redacted_body;
    comment.redaction_basis = redaction_basis.clone();
    comment.reviewed_at_unix_seconds = Some(now_unix_seconds());
    comment.redacted_at_unix_seconds = Some(now_unix_seconds());
    let comment_id = comment.id.clone();
    let commenter_name = comment.commenter_name.clone();
    push_audit(
        state,
        "civicclerk",
        "redact-public-comment",
        format!(
            "Redacted public comment {comment_id} from {commenter_name}; basis: {redaction_basis}"
        ),
    );
    Ok(format!(
        "Public comment {comment_id} redacted with statutory basis recorded."
    ))
}

fn adopt_minutes(state: &mut CityWorkState, payload: Option<&Value>) -> Result<String, String> {
    let meeting = selected_meeting_mut(state, payload)?;
    ensure_meeting_can_change(meeting)?;
    if meeting.minutes.trim().is_empty() {
        return Err("Save a minutes draft before adopting minutes.".to_string());
    }
    let title = meeting.title.clone();
    meeting.minutes_adopted_at_unix_seconds = Some(now_unix_seconds());
    meeting.status = "minutes adopted".to_string();
    push_audit(
        state,
        "civicclerk",
        "adopt-minutes",
        format!("Adopted minutes for: {title}"),
    );
    Ok("Minutes marked adopted with audit evidence.".to_string())
}

fn list_or_default(values: &[String], empty: &str) -> String {
    if values.is_empty() {
        empty.to_string()
    } else {
        values
            .iter()
            .map(|value| format!("- {value}"))
            .collect::<Vec<_>>()
            .join("\n")
    }
}

fn push_records_timeline(request: &mut RecordsRequest, action: &str, actor: &str, note: String) {
    let id = format!(
        "records-timeline-{}-{}",
        now_unix_seconds(),
        request.timeline.len() + 1
    );
    request.timeline.push(RecordsTimelineEntry {
        id,
        action: action.to_string(),
        actor: actor.to_string(),
        note,
        created_at_unix_seconds: now_unix_seconds(),
    });
}

fn records_timeline_or_default(entries: &[RecordsTimelineEntry]) -> String {
    if entries.is_empty() {
        return "No request timeline entries recorded.".to_string();
    }
    entries
        .iter()
        .map(|entry| format!("- {} by {}: {}", entry.action, entry.actor, entry.note))
        .collect::<Vec<_>>()
        .join("\n")
}

fn code_version_history_or_default(entries: &[CodeVersionEntry]) -> String {
    if entries.is_empty() {
        return "No version or codifier history recorded.".to_string();
    }
    entries
        .iter()
        .map(|entry| {
            let url = if entry.authoritative_url.is_empty() {
                "No authoritative URL recorded."
            } else {
                &entry.authoritative_url
            };
            format!(
                "- {}: {} from {} at {}\n  URL: {}",
                entry.status, entry.label, entry.source, entry.recorded_at_unix_seconds, url
            )
        })
        .collect::<Vec<_>>()
        .join("\n")
}

fn notice_checklists_or_default(entries: &[NoticeChecklist]) -> String {
    if entries.is_empty() {
        return "No notice checklist has been approved.".to_string();
    }
    entries
        .iter()
        .map(|entry| {
            format!(
                "- {} notice; basis: {}; deadline: {}; time zone: {}; status: {}",
                entry.meeting_type,
                entry.statutory_basis,
                entry.posting_deadline,
                entry.time_zone,
                entry.status
            )
        })
        .collect::<Vec<_>>()
        .join("\n")
}

fn notice_postings_or_default(entries: &[NoticePosting]) -> String {
    if entries.is_empty() {
        return "No notice posting evidence recorded.".to_string();
    }
    entries
        .iter()
        .map(|entry| {
            let posted_on = if entry.posted_on.is_empty() {
                format!("Unix timestamp {}", entry.posted_at_unix_seconds)
            } else {
                format!("{} {}", entry.posted_on, entry.time_zone)
            };
            format!(
                "- {} via {} on {}; confirmation: {}",
                entry.location, entry.method, posted_on, entry.confirmation
            )
        })
        .collect::<Vec<_>>()
        .join("\n")
}

fn code_version_history_search_text(entries: &[CodeVersionEntry]) -> String {
    entries
        .iter()
        .map(|entry| {
            format!(
                "{} {} {} {} {}",
                entry.status, entry.label, entry.source, entry.authoritative_url, entry.note
            )
        })
        .collect::<Vec<_>>()
        .join(" ")
}

fn meeting_packet_contents(meeting: &Meeting) -> String {
    let agenda = if meeting.agenda_items.is_empty() {
        "No agenda items recorded.".to_string()
    } else {
        meeting
            .agenda_items
            .iter()
            .map(|item| format!("- {} [{} / {}]", item.title, item.status, item.visibility))
            .collect::<Vec<_>>()
            .join("\n")
    };
    let votes = list_or_default(&meeting.votes, "No outcomes recorded.");
    let action_items = list_or_default(&meeting.action_items, "No action items recorded.");
    let resident_comments =
        list_or_default(&meeting.resident_comments, "No resident comments recorded.");
    let public_comments = if meeting.public_comments.is_empty() {
        "No public comments submitted.".to_string()
    } else {
        meeting
            .public_comments
            .iter()
            .map(|comment| {
                let body = if comment.status == "redacted for public record"
                    && !comment.redacted_body.is_empty()
                {
                    format!(
                        "{} (Redaction basis: {})",
                        comment.redacted_body, comment.redaction_basis
                    )
                } else {
                    comment.body.clone()
                };
                format!(
                    "- {} [{} / {}]: {}",
                    comment.commenter_name, comment.mode, comment.status, body
                )
            })
            .collect::<Vec<_>>()
            .join("\n")
    };
    let minutes_adoption = meeting
        .minutes_adopted_at_unix_seconds
        .map(|timestamp| format!("Adopted at Unix timestamp {timestamp}."))
        .unwrap_or_else(|| "Minutes have not been adopted.".to_string());
    let notice_checklists = notice_checklists_or_default(&meeting.notice_checklists);
    let notice_postings = notice_postings_or_default(&meeting.notice_postings);
    format!(
        "# {}\n\nDate: {}\nStatus: {}\nNotice: {}\n\n## Notice Checklist\n{}\n\n## Notice Posting Evidence\n{}\n\n## Summary\n{}\n\n## Agenda\n{}\n\n## Minutes\n{}\n\n## Minutes Adoption\n{}\n\n## Outcomes\n{}\n\n## Action Items\n{}\n\n## Staff-Entered Resident Comments\n{}\n\n## Public Comments\n{}\n",
        meeting.title,
        meeting.meeting_date,
        meeting.status,
        meeting.notice_status,
        notice_checklists,
        notice_postings,
        if meeting.summary.is_empty() {
            "No summary recorded."
        } else {
            &meeting.summary
        },
        agenda,
        if meeting.minutes.is_empty() {
            "No minutes draft recorded."
        } else {
            &meeting.minutes
        },
        minutes_adoption,
        votes,
        action_items,
        resident_comments,
        public_comments
    )
}

fn export_meeting_packet(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let meeting = selected_meeting_mut(state, payload)?;
    let contents = meeting_packet_contents(meeting);
    let export_path = write_export_file("meetings", &meeting.title, &contents)?;
    meeting.exports.push(export_path.clone());
    if meeting.archived_at_unix_seconds.is_none() {
        meeting.status = "packet exported".to_string();
    }
    push_audit(
        state,
        "civicclerk",
        "export-meeting-packet",
        format!("Exported meeting packet: {export_path}"),
    );
    Ok(format!("Meeting packet export written to {export_path}."))
}

fn archive_meeting(state: &mut CityWorkState, payload: Option<&Value>) -> Result<String, String> {
    let (meeting_id, title, export_path, public_payload) = {
        let meeting = selected_meeting_mut(state, payload)?;
        if meeting.minutes_adopted_at_unix_seconds.is_none() {
            return Err(
                "Adopt the minutes before archiving the public meeting record.".to_string(),
            );
        }
        meeting.status = "archived public record".to_string();
        meeting.archived_at_unix_seconds = Some(now_unix_seconds());
        let contents = meeting_packet_contents(meeting);
        let export_path = write_export_file("meetings", &meeting.title, &contents)?;
        meeting.exports.push(export_path.clone());
        (
            meeting.id.clone(),
            meeting.title.clone(),
            export_path,
            contents,
        )
    };
    push_publication_event(
        state,
        "civicclerk",
        meeting_id,
        "meeting-archive",
        public_payload,
    );
    push_audit(
        state,
        "civicclerk",
        "archive-meeting",
        format!("Archived public meeting record for {title}: {export_path}"),
    );
    Ok(format!("Public meeting archive written to {export_path}."))
}

fn create_records_request(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let requester = payload_string(payload, "requester")?;
    let summary = payload_string(payload, "summary")?;
    let deadline = payload_string(payload, "deadline")?;
    parse_iso_date(&deadline, "records response deadline")?;
    let deadline_basis = payload_optional_string(payload, "deadlineBasis");
    let deadline_basis = if deadline_basis.is_empty() {
        "Staff-entered deadline at intake.".to_string()
    } else {
        deadline_basis
    };
    let id = new_id("records", state.records_requests.len());
    let tracking_number = records_tracking_number(state.records_requests.len());
    state.records_requests.insert(
        0,
        RecordsRequest {
            id,
            public_tracking_number: tracking_number.clone(),
            requester: requester.clone(),
            requester_contact: String::new(),
            submitted_via: "Staff intake".to_string(),
            summary,
            deadline: deadline.clone(),
            deadline_basis,
            status: "received".to_string(),
            assigned_to: String::new(),
            clarification_notes: Vec::new(),
            search_notes: Vec::new(),
            exemption_reviews: Vec::new(),
            fee_estimate: String::new(),
            citations: Vec::new(),
            response_draft: String::new(),
            approval_notes: Vec::new(),
            exports: Vec::new(),
            timeline: Vec::new(),
            deadline_reviewed_at_unix_seconds: Some(now_unix_seconds()),
            approved_at_unix_seconds: None,
            fulfilled_at_unix_seconds: None,
            closed_at_unix_seconds: None,
            created_at_unix_seconds: now_unix_seconds(),
        },
    );
    push_records_timeline(
        &mut state.records_requests[0],
        "intake",
        "records staff",
        format!("Staff created request {tracking_number} with deadline {deadline}."),
    );
    let request_id = state.records_requests[0].id.clone();
    push_notification_event(
        state,
        "civicrecords-ai",
        request_id,
        "records staff",
        format!("Records request {tracking_number} created"),
        format!("Staff-created request for {requester} is saved locally with deadline {deadline}."),
    );
    push_audit(
        state,
        "civicrecords-ai",
        "create-records-request",
        format!("Created records request {tracking_number} for: {requester}"),
    );
    Ok(format!(
        "Records request {tracking_number} saved locally with deadline tracking."
    ))
}

fn submit_public_records_request(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let requester = payload_string(payload, "requester")?;
    let requester_contact = payload_string(payload, "requesterContact")?;
    let summary = payload_string(payload, "summary")?;
    let deadline = payload_optional_string(payload, "deadline");
    let deadline = if deadline.is_empty() {
        "Pending clerk deadline review".to_string()
    } else {
        deadline
    };
    let id = new_id("records", state.records_requests.len());
    let tracking_number = records_tracking_number(state.records_requests.len());
    state.records_requests.insert(
        0,
        RecordsRequest {
            id,
            public_tracking_number: tracking_number.clone(),
            requester: requester.clone(),
            requester_contact: requester_contact.clone(),
            submitted_via: "Resident/Public local intake".to_string(),
            summary,
            deadline,
            deadline_basis: String::new(),
            status: "public intake received".to_string(),
            assigned_to: String::new(),
            clarification_notes: Vec::new(),
            search_notes: Vec::new(),
            exemption_reviews: Vec::new(),
            fee_estimate: String::new(),
            citations: Vec::new(),
            response_draft: String::new(),
            approval_notes: Vec::new(),
            exports: Vec::new(),
            timeline: Vec::new(),
            deadline_reviewed_at_unix_seconds: None,
            approved_at_unix_seconds: None,
            fulfilled_at_unix_seconds: None,
            closed_at_unix_seconds: None,
            created_at_unix_seconds: now_unix_seconds(),
        },
    );
    push_records_timeline(
        &mut state.records_requests[0],
        "public intake",
        "resident/public",
        format!("Public request {tracking_number} received for staff review."),
    );
    let request_id = state.records_requests[0].id.clone();
    push_notification_event(
        state,
        "civicrecords-ai",
        request_id.clone(),
        "records staff",
        format!("New public records request {tracking_number}"),
        format!(
            "{requester} submitted request {tracking_number}. Review the deadline, scope, assignment, and contact path in the local Records workflow."
        ),
    );
    push_notification_event(
        state,
        "civicrecords-ai",
        request_id,
        "requester",
        format!("Records request {tracking_number} received"),
        format!(
            "Request {tracking_number} was received locally. Staff will review the deadline and response path. Contact on file: {requester_contact}."
        ),
    );
    push_audit(
        state,
        "civicrecords-ai",
        "submit-public-records-request",
        format!("Received public records request {tracking_number} from: {requester}"),
    );
    Ok(format!(
        "Public records request {tracking_number} received. Staff can now review, assign, and track it locally."
    ))
}

fn set_records_deadline(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let deadline = payload_string(payload, "deadline")
        .map_err(|_| "Enter the records response deadline as YYYY-MM-DD.".to_string())?;
    let deadline_basis = payload_string(payload, "deadlineBasis")
        .map_err(|_| "Enter the statutory or policy basis for the records deadline.".to_string())?;
    parse_iso_date(&deadline, "records response deadline")?;
    let (request_id, tracking_number, requester) = {
        let request = selected_record_mut(state, payload)?;
        ensure_records_request_active(request)?;
        request.deadline = deadline.clone();
        request.deadline_basis = deadline_basis.clone();
        request.deadline_reviewed_at_unix_seconds = Some(now_unix_seconds());
        request.status = "deadline reviewed".to_string();
        push_records_timeline(
            request,
            "deadline reviewed",
            "records staff",
            format!("Response deadline set to {deadline}; basis: {deadline_basis}."),
        );
        (
            request.id.clone(),
            request.public_tracking_number.clone(),
            request.requester.clone(),
        )
    };
    push_notification_event(
        state,
        "civicrecords-ai",
        request_id,
        "requester",
        format!("Records request {tracking_number} deadline reviewed"),
        format!(
            "Staff reviewed the response deadline for {requester}: {deadline}. Basis: {deadline_basis}."
        ),
    );
    push_audit(
        state,
        "civicrecords-ai",
        "set-records-deadline",
        format!(
            "Records request {tracking_number} deadline set to {deadline}; basis: {deadline_basis}"
        ),
    );
    Ok("Records deadline reviewed and saved locally with basis evidence.".to_string())
}

fn request_records_clarification(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let note = payload_string(payload, "clarificationNote")?;
    let (request_id, tracking_number) = {
        let request = selected_record_mut(state, payload)?;
        ensure_records_request_active(request)?;
        request.clarification_notes.push(note.clone());
        request.status = "clarification".to_string();
        push_records_timeline(
            request,
            "clarification requested",
            "records staff",
            note.clone(),
        );
        (request.id.clone(), request.public_tracking_number.clone())
    };
    push_notification_event(
        state,
        "civicrecords-ai",
        request_id,
        "requester",
        format!("Records request {tracking_number} needs clarification"),
        format!("Staff requested clarification before completing the records search: {note}"),
    );
    push_audit(
        state,
        "civicrecords-ai",
        "request-records-clarification",
        "Saved clarification note for records request.".to_string(),
    );
    Ok("Clarification note saved; no denial or release occurred.".to_string())
}

fn assign_records_request(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let assigned_to = payload_string(payload, "assignedTo")?;
    let request = selected_record_mut(state, payload)?;
    ensure_records_request_active(request)?;
    request.assigned_to = assigned_to.clone();
    request.status = "assigned".to_string();
    push_records_timeline(
        request,
        "assigned",
        "records staff",
        format!("Assigned to {assigned_to}."),
    );
    push_audit(
        state,
        "civicrecords-ai",
        "assign-records-request",
        format!("Assigned records request to: {assigned_to}"),
    );
    Ok("Records request assigned for staff search and review.".to_string())
}

fn record_records_search(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let source_note = payload_string(payload, "sourceNote")?;
    let citation = payload_optional_string(payload, "citation");
    let request = selected_record_mut(state, payload)?;
    ensure_records_request_active(request)?;
    request.search_notes.push(source_note.clone());
    if !citation.is_empty() {
        request.citations.push(citation.clone());
    }
    request.status = "searching".to_string();
    push_records_timeline(
        request,
        "search recorded",
        "records staff",
        format!(
            "{}{}",
            source_note,
            if citation.is_empty() {
                String::new()
            } else {
                format!(" Citation: {citation}.")
            }
        ),
    );
    push_audit(
        state,
        "civicrecords-ai",
        "record-records-search",
        "Recorded records search source note.".to_string(),
    );
    Ok("Search source note saved with citation evidence.".to_string())
}

fn add_records_exemption_review(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let exemption_note = payload_string(payload, "exemptionNote")?;
    let request = selected_record_mut(state, payload)?;
    ensure_records_request_active(request)?;
    request.exemption_reviews.push(exemption_note.clone());
    request.status = "in review".to_string();
    push_records_timeline(
        request,
        "exemption review recorded",
        "records staff",
        exemption_note,
    );
    push_audit(
        state,
        "civicrecords-ai",
        "add-records-exemption-review",
        "Recorded human exemption review note.".to_string(),
    );
    Ok("Exemption review note saved for human approval.".to_string())
}

fn estimate_records_fee(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let fee_estimate = payload_string(payload, "feeEstimate")?;
    let request = selected_record_mut(state, payload)?;
    ensure_records_request_active(request)?;
    request.fee_estimate = fee_estimate.clone();
    request.status = "ready".to_string();
    push_records_timeline(
        request,
        "fee estimate saved",
        "records staff",
        fee_estimate.clone(),
    );
    push_audit(
        state,
        "civicrecords-ai",
        "estimate-records-fee",
        format!("Saved records fee estimate: {fee_estimate}"),
    );
    Ok("Fee estimate saved before approval or fulfillment.".to_string())
}

fn draft_records_response(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let draft = payload_string(payload, "responseDraft")?;
    let citation = payload_optional_string(payload, "citation");
    let request = selected_record_mut(state, payload)?;
    ensure_records_request_active(request)?;
    request.response_draft = draft;
    request.status = "drafted".to_string();
    if !citation.is_empty() {
        request.citations.push(citation.clone());
    }
    push_records_timeline(
        request,
        "response drafted",
        "records staff",
        if citation.is_empty() {
            "Draft response saved.".to_string()
        } else {
            format!("Draft response saved with citation {citation}.")
        },
    );
    push_audit(
        state,
        "civicrecords-ai",
        "draft-records-response",
        "Drafted records response with local citation evidence.".to_string(),
    );
    Ok("Records response draft saved with citation evidence.".to_string())
}

fn suggest_records_response(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let request = selected_record_mut(state, payload)?;
    ensure_records_request_active(request)?;
    if request.search_notes.is_empty() && request.citations.is_empty() {
        return Err(
            "Record at least one search note or citation before generating a local AI records draft."
                .to_string(),
        );
    }
    let prompt = format!(
        "Draft an internal public records response for staff review. Use only the facts below. Do not claim legal authority beyond the cited notes. Keep the response concise and leave placeholders for attachments if needed.\n\nRequester: {}\nDeadline: {}\nRequest summary: {}\nClarification notes: {}\nSearch notes: {}\nExemption review notes: {}\nFee estimate: {}\nCitations/source notes: {}\n",
        request.requester,
        request.deadline,
        request.summary,
        list_or_default(&request.clarification_notes, "No clarification notes recorded."),
        list_or_default(&request.search_notes, "No search notes recorded."),
        list_or_default(&request.exemption_reviews, "No exemption review notes recorded."),
        if request.fee_estimate.is_empty() {
            "No fee estimate recorded."
        } else {
            &request.fee_estimate
        },
        list_or_default(&request.citations, "No citations recorded.")
    );
    let (runtime_model, generated) = crate::model::generate_local_text(&prompt)?;
    request.response_draft = generated;
    request.status = "local AI draft ready for review".to_string();
    push_records_timeline(
        request,
        "local AI draft generated",
        "local model",
        format!("Draft generated with {runtime_model}; human approval still required."),
    );
    push_audit(
        state,
        "civicrecords-ai",
        "suggest-records-response",
        format!("Generated local AI records response draft with {runtime_model}; human approval still required."),
    );
    Ok(
        "Local AI records draft generated. Review, edit, and approve with citations before export."
            .to_string(),
    )
}

fn approve_records_response(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let approval_note = payload_optional_string(payload, "approvalNote");
    let request = selected_record_mut(state, payload)?;
    ensure_records_request_active(request)?;
    if request.response_draft.trim().is_empty() {
        return Err("Draft a records response before approval.".to_string());
    }
    if request.citations.is_empty() {
        return Err("Add at least one citation or source note before approval.".to_string());
    }
    if !approval_note.is_empty() {
        request.approval_notes.push(approval_note.clone());
    }
    request.approved_at_unix_seconds = Some(now_unix_seconds());
    request.status = "approved".to_string();
    push_records_timeline(
        request,
        "response approved",
        "records staff",
        if approval_note.is_empty() {
            "Response approved by a human reviewer.".to_string()
        } else {
            approval_note
        },
    );
    push_audit(
        state,
        "civicrecords-ai",
        "approve-records-response",
        "Approved records response for export by a human reviewer.".to_string(),
    );
    Ok("Records response approved by staff; export is now available.".to_string())
}

fn export_records_response(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let request = selected_record_mut(state, payload)?;
    ensure_records_request_active(request)?;
    if request.response_draft.trim().is_empty() {
        return Err("Draft a records response before exporting.".to_string());
    }
    if request.approved_at_unix_seconds.is_none() {
        return Err(
            "Approve the records response before exporting the response package.".to_string(),
        );
    }
    let citations = list_or_default(&request.citations, "No citations recorded.");
    let search_notes = list_or_default(&request.search_notes, "No search notes recorded.");
    let exemption_reviews = list_or_default(
        &request.exemption_reviews,
        "No exemption review notes recorded.",
    );
    let clarification_notes = list_or_default(
        &request.clarification_notes,
        "No clarification notes recorded.",
    );
    let approval_notes = list_or_default(&request.approval_notes, "No approval note recorded.");
    let request_timeline = records_timeline_or_default(&request.timeline);
    let contents = format!(
        "# Records Response\n\nTracking number: {}\nRequester: {}\nContact: {}\nSubmitted via: {}\nDeadline: {}\nDeadline basis: {}\nAssigned to: {}\nStatus: {}\nFee estimate: {}\n\n## Request\n{}\n\n## Request Timeline\n{}\n\n## Clarification Notes\n{}\n\n## Search Notes\n{}\n\n## Exemption Review\n{}\n\n## Approved Response\n{}\n\n## Citations\n{}\n\n## Approval Notes\n{}\n",
        if request.public_tracking_number.is_empty() {
            "Not assigned"
        } else {
            &request.public_tracking_number
        },
        request.requester,
        if request.requester_contact.is_empty() {
            "No contact recorded."
        } else {
            &request.requester_contact
        },
        if request.submitted_via.is_empty() {
            "Staff intake"
        } else {
            &request.submitted_via
        },
        request.deadline,
        if request.deadline_basis.is_empty() {
            "No deadline basis recorded."
        } else {
            &request.deadline_basis
        },
        if request.assigned_to.is_empty() {
            "Unassigned"
        } else {
            &request.assigned_to
        },
        request.status,
        if request.fee_estimate.is_empty() {
            "No fee estimate recorded."
        } else {
            &request.fee_estimate
        },
        request.summary,
        request_timeline,
        clarification_notes,
        search_notes,
        exemption_reviews,
        request.response_draft,
        citations,
        approval_notes
    );
    let export_path = write_export_file("records", &request.requester, &contents)?;
    request.exports.push(export_path.clone());
    request.status = "response package exported".to_string();
    push_records_timeline(
        request,
        "response package exported",
        "records staff",
        format!("Approved response package exported to {export_path}."),
    );
    push_audit(
        state,
        "civicrecords-ai",
        "export-records-response",
        format!("Exported records response package: {export_path}"),
    );
    Ok(format!("Records response export written to {export_path}."))
}

fn open_exports_folder(payload: Option<&Value>) -> Result<String, String> {
    let folder = payload_optional_string(payload, "folder");
    let (path, label) = match folder.as_str() {
        "" | "all" => (exports_dir(), "all exports"),
        "meetings" => (exports_dir().join("meetings"), "meeting exports"),
        "records" => (exports_dir().join("records"), "records exports"),
        "code" => (exports_dir().join("code"), "code exports"),
        _ => {
            return Err(
                "Choose a valid export folder: all, meetings, records, or code.".to_string(),
            )
        }
    };
    crate::local_shell::open_local_folder(&path)?;
    Ok(format!(
        "Opened the local {label} folder: {}",
        path.to_string_lossy()
    ))
}

fn fulfill_records_request(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let (request_id, tracking_number, requester, deadline, exports, public_payload) = {
        let request = selected_record_mut(state, payload)?;
        ensure_records_request_active(request)?;
        if request.approved_at_unix_seconds.is_none() {
            return Err("Approve the records response before fulfillment.".to_string());
        }
        if request.exports.is_empty() {
            return Err(
                "Export the approved records response package before fulfillment.".to_string(),
            );
        }
        request.fulfilled_at_unix_seconds = Some(now_unix_seconds());
        request.status = "fulfilled".to_string();
        push_records_timeline(
            request,
            "fulfilled",
            "records staff",
            "Approved response package marked fulfilled.".to_string(),
        );
        (
            request.id.clone(),
            request.public_tracking_number.clone(),
            request.requester.clone(),
            request.deadline.clone(),
            request.exports.join("; "),
            format!(
                "Records request {} fulfilled for {}. Deadline: {}. Exports: {}.",
                if request.public_tracking_number.is_empty() {
                    "without tracking number"
                } else {
                    &request.public_tracking_number
                },
                request.requester,
                request.deadline,
                request.exports.join("; ")
            ),
        )
    };
    push_publication_event(
        state,
        "civicrecords-ai",
        request_id.clone(),
        "records-response",
        public_payload,
    );
    push_notification_event(
        state,
        "civicrecords-ai",
        request_id,
        "requester",
        format!("Records request {tracking_number} response ready"),
        format!(
            "The approved response for {requester} has been marked fulfilled. Deadline: {deadline}. Export package: {exports}."
        ),
    );
    push_audit(
        state,
        "civicrecords-ai",
        "fulfill-records-request",
        "Marked records request fulfilled after human approval and export.".to_string(),
    );
    Ok("Records request fulfilled and eligible for public status display.".to_string())
}

fn close_records_request(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let (request_id, tracking_number) = {
        let request = selected_record_mut(state, payload)?;
        if request.closed_at_unix_seconds.is_some() || request.status == "closed" {
            return Err("This records request is already closed.".to_string());
        }
        if request.fulfilled_at_unix_seconds.is_none() {
            return Err("Fulfill the records request before closing it.".to_string());
        }
        request.closed_at_unix_seconds = Some(now_unix_seconds());
        request.status = "closed".to_string();
        push_records_timeline(
            request,
            "closed",
            "records staff",
            "Fulfilled request closed with audit, export, and notification evidence preserved."
                .to_string(),
        );
        (request.id.clone(), request.public_tracking_number.clone())
    };
    push_notification_event(
        state,
        "civicrecords-ai",
        request_id,
        "records staff",
        format!("Records request {tracking_number} closed"),
        "The fulfilled records request is closed. Audit, export, publication, and notification evidence remain in the local profile.".to_string(),
    );
    push_audit(
        state,
        "civicrecords-ai",
        "close-records-request",
        "Closed fulfilled records request.".to_string(),
    );
    Ok("Records request closed with audit evidence preserved.".to_string())
}

fn mark_notification_sent(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let (module_id, subject) = {
        let notification = selected_notification_mut(state, payload)?;
        if notification.status == "sent / logged" || notification.sent_at_unix_seconds.is_some() {
            return Err("This local notification is already marked sent.".to_string());
        }
        notification.status = "sent / logged".to_string();
        notification.sent_at_unix_seconds = Some(now_unix_seconds());
        (notification.module_id.clone(), notification.subject.clone())
    };
    push_audit(
        state,
        &module_id,
        "mark-notification-sent",
        format!("Marked local notification sent: {subject}"),
    );
    Ok("Notification marked sent in the local notification outbox.".to_string())
}

fn append_code_version_history(
    source: &mut CodeSource,
    status: &str,
    label: String,
    source_name: String,
    authoritative_url: String,
    note: String,
) {
    let id = new_id("code-version", source.version_history.len());
    source.version_history.push(CodeVersionEntry {
        id,
        label,
        source: source_name,
        authoritative_url,
        note,
        status: status.to_string(),
        recorded_at_unix_seconds: now_unix_seconds(),
    });
}

fn import_code_source(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let title = payload_string(payload, "title")?;
    let citation = payload_string(payload, "citation")?;
    let body = payload_string(payload, "body")?;
    let id = new_id("code", state.code_sources.len());
    let mut source = CodeSource {
        id,
        title: title.clone(),
        citation: citation.clone(),
        body,
        status: "imported".to_string(),
        codifier_name: String::new(),
        authoritative_url: String::new(),
        version_label: String::new(),
        codifier_sync_status: default_code_sync_status(),
        codifier_sync_errors: Vec::new(),
        last_codifier_sync_at_unix_seconds: None,
        stale_since_unix_seconds: None,
        amendment_notes: Vec::new(),
        version_history: Vec::new(),
        staff_guidance: String::new(),
        plain_language_summary: String::new(),
        guidance_approved_at_unix_seconds: None,
        public_status: default_code_public_status(),
        public_exports: Vec::new(),
        published_at_unix_seconds: None,
        created_at_unix_seconds: now_unix_seconds(),
    };
    append_code_version_history(
        &mut source,
        "local import",
        "Local import".to_string(),
        "CivicSuite local source".to_string(),
        String::new(),
        format!("Imported with citation {citation}."),
    );
    state.code_sources.insert(0, source);
    push_audit(
        state,
        "civiccode",
        "import-code-source",
        format!("Imported code source: {title}"),
    );
    Ok("Municipal code source imported locally with citation.".to_string())
}

fn selected_code_source_index(
    state: &CityWorkState,
    payload: Option<&Value>,
) -> Result<usize, String> {
    let source_id = payload_optional_string(payload, "codeSourceId");
    if source_id.is_empty() {
        if state.code_sources.is_empty() {
            return Err("Import a code source before changing its public status.".to_string());
        }
        return Ok(0);
    }
    state
        .code_sources
        .iter()
        .position(|source| source.id == source_id)
        .ok_or_else(|| {
            "The selected code source was not found in the local city profile.".to_string()
        })
}

fn selected_code_source_mut<'a>(
    state: &'a mut CityWorkState,
    payload: Option<&Value>,
) -> Result<&'a mut CodeSource, String> {
    let index = selected_code_source_index(state, payload)?;
    Ok(&mut state.code_sources[index])
}

fn record_codifier_sync(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let codifier_name = payload_string(payload, "codifierName")?;
    let authoritative_url = payload_optional_string(payload, "authoritativeUrl");
    let version_label = payload_optional_string(payload, "versionLabel");
    let source = selected_code_source_mut(state, payload)?;
    source.codifier_name = codifier_name.clone();
    source.authoritative_url = authoritative_url.clone();
    source.version_label = version_label.clone();
    source.codifier_sync_status = "synced".to_string();
    source.codifier_sync_errors.clear();
    source.last_codifier_sync_at_unix_seconds = Some(now_unix_seconds());
    source.stale_since_unix_seconds = None;
    source.status = "codifier synced".to_string();
    let history_label = if version_label.is_empty() {
        "Codifier sync without version label".to_string()
    } else {
        version_label
    };
    append_code_version_history(
        source,
        "codifier synced",
        history_label,
        codifier_name.clone(),
        authoritative_url,
        "Codifier sync recorded locally.".to_string(),
    );
    push_audit(
        state,
        "civiccode",
        "record-codifier-sync",
        format!("Recorded codifier sync from: {codifier_name}"),
    );
    Ok("Codifier sync recorded and stale flag cleared.".to_string())
}

fn record_codifier_sync_failure(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let sync_error = payload_string(payload, "syncError")?;
    let source = selected_code_source_mut(state, payload)?;
    source.codifier_sync_status = "sync failed".to_string();
    source.codifier_sync_errors.push(sync_error.clone());
    source.status = "codifier sync failed".to_string();
    push_audit(
        state,
        "civiccode",
        "record-codifier-sync-failure",
        "Recorded codifier sync failure.".to_string(),
    );
    Ok("Codifier sync failure recorded for retry.".to_string())
}

fn retry_codifier_sync(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let source = selected_code_source_mut(state, payload)?;
    if source.codifier_sync_errors.is_empty() && source.codifier_sync_status != "sync failed" {
        return Err("Record a codifier sync failure before retrying.".to_string());
    }
    source.codifier_sync_status = "retry queued".to_string();
    source.status = "codifier retry queued".to_string();
    push_audit(
        state,
        "civiccode",
        "retry-codifier-sync",
        "Queued codifier sync retry.".to_string(),
    );
    Ok("Codifier sync retry queued locally.".to_string())
}

fn mark_code_stale(state: &mut CityWorkState, payload: Option<&Value>) -> Result<String, String> {
    let amendment_note = payload_string(payload, "amendmentNote")?;
    let source = selected_code_source_mut(state, payload)?;
    source.amendment_notes.push(amendment_note.clone());
    source.stale_since_unix_seconds = Some(now_unix_seconds());
    source.codifier_sync_status = "stale - codifier update pending".to_string();
    source.status = "codifier update pending".to_string();
    let history_label = if source.version_label.is_empty() {
        "Current local version".to_string()
    } else {
        source.version_label.clone()
    };
    let history_source = if source.codifier_name.is_empty() {
        "Local code source".to_string()
    } else {
        source.codifier_name.clone()
    };
    let history_url = source.authoritative_url.clone();
    append_code_version_history(
        source,
        "stale pending update",
        history_label,
        history_source,
        history_url,
        amendment_note.clone(),
    );
    push_audit(
        state,
        "civiccode",
        "mark-code-stale",
        "Marked code source stale pending codifier update.".to_string(),
    );
    Ok("Code source marked stale until the codifier update is ingested.".to_string())
}

fn draft_code_guidance(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let guidance = payload_string(payload, "guidanceDraft")?;
    let summary = payload_optional_string(payload, "summaryDraft");
    let source = selected_code_source_mut(state, payload)?;
    source.staff_guidance = guidance;
    if !summary.is_empty() {
        source.plain_language_summary = summary;
    }
    source.guidance_approved_at_unix_seconds = None;
    source.status = "guidance drafted".to_string();
    push_audit(
        state,
        "civiccode",
        "draft-code-guidance",
        "Drafted staff guidance and plain-language summary.".to_string(),
    );
    Ok("Code guidance draft saved for human approval.".to_string())
}

fn suggest_code_guidance(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let source = selected_code_source_mut(state, payload)?;
    let prompt = format!(
        "Draft internal municipal code staff guidance for human review. Use only the cited source text below. Do not provide legal advice. Include practical staff considerations and keep public-facing language non-authoritative.\n\nTitle: {}\nCitation: {}\nAuthoritative URL: {}\nCodifier sync status: {}\nCurrent public status: {}\nSource text:\n{}\n",
        source.title,
        source.citation,
        if source.authoritative_url.is_empty() {
            "No authoritative URL recorded."
        } else {
            &source.authoritative_url
        },
        source.codifier_sync_status,
        source.public_status,
        source.body
    );
    let (runtime_model, generated) = crate::model::generate_local_text(&prompt)?;
    source.staff_guidance = generated;
    source.guidance_approved_at_unix_seconds = None;
    source.status = "local AI guidance draft ready for review".to_string();
    push_audit(
        state,
        "civiccode",
        "suggest-code-guidance",
        format!("Generated local AI code guidance draft with {runtime_model}; human approval still required."),
    );
    Ok("Local AI code guidance draft generated. Review and approve before publication or staff reliance.".to_string())
}

fn approve_code_guidance(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let source = selected_code_source_mut(state, payload)?;
    if source.staff_guidance.trim().is_empty() && source.plain_language_summary.trim().is_empty() {
        return Err(
            "Draft staff guidance or a plain-language summary before approval.".to_string(),
        );
    }
    source.guidance_approved_at_unix_seconds = Some(now_unix_seconds());
    source.status = "guidance approved".to_string();
    push_audit(
        state,
        "civiccode",
        "approve-code-guidance",
        "Approved code guidance by human reviewer.".to_string(),
    );
    Ok("Code guidance approved; public summaries remain labeled non-authoritative.".to_string())
}

fn publish_code_source(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let (source_id, title, citation, export_path, public_payload) = {
        let source = selected_code_source_mut(state, payload)?;
        let codifier = if source.codifier_name.is_empty() {
            "No codifier sync recorded.".to_string()
        } else {
            format!(
                "{}{}{}",
                source.codifier_name,
                if source.version_label.is_empty() {
                    ""
                } else {
                    " / "
                },
                source.version_label
            )
        };
        let summary = if source.guidance_approved_at_unix_seconds.is_some()
            && !source.plain_language_summary.trim().is_empty()
        {
            source.plain_language_summary.clone()
        } else {
            "No approved non-authoritative summary.".to_string()
        };
        let public_update_status = if source.stale_since_unix_seconds.is_some() {
            "Codifier update pending; staff amendment notes stay in the Staff surface."
        } else {
            "No public stale-code warning recorded."
        };
        let version_history = code_version_history_or_default(&source.version_history);
        let contents = format!(
            "# Municipal Code Source\n\nTitle: {}\nCitation: {}\nStatus: {}\nPublic status: published\nCodifier sync: {}\nAuthoritative URL: {}\n\n## Authoritative Text\n{}\n\n## Non-Authoritative Plain-English Summary\n{}\n\n## Public Update Status\n{}\n\n## Version / Codifier History\n{}\n\n## Staff Boundary\nInternal staff guidance, operational sync errors, and staff amendment notes stay in the Staff surface and are not included in this public export.\n\nFor legal interpretation, contact city staff and rely on the authoritative codified ordinance text.\n",
            source.title,
            source.citation,
            source.status,
            codifier,
            if source.authoritative_url.is_empty() {
                "No authoritative URL recorded."
            } else {
                &source.authoritative_url
            },
            source.body,
            summary,
            public_update_status,
            version_history
        );
        let export_path = write_export_file("code", &source.title, &contents)?;
        source.public_status = "published".to_string();
        source.public_exports.push(export_path.clone());
        source.published_at_unix_seconds = Some(now_unix_seconds());
        (
            source.id.clone(),
            source.title.clone(),
            source.citation.clone(),
            export_path,
            contents,
        )
    };
    push_publication_event(state, "civiccode", source_id, "code-source", public_payload);
    push_audit(
        state,
        "civiccode",
        "publish-code-source",
        format!("Published code source {citation}: {export_path}"),
    );
    Ok(format!("{title} is published for Resident/Public search."))
}

fn unpublish_code_source(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let (source_id, title, citation) = {
        let source = selected_code_source_mut(state, payload)?;
        source.public_status = default_code_public_status();
        source.published_at_unix_seconds = None;
        (
            source.id.clone(),
            source.title.clone(),
            source.citation.clone(),
        )
    };
    retract_publication_event(state, "civiccode", &source_id, "civiccode");
    push_audit(
        state,
        "civiccode",
        "unpublish-code-source",
        format!("Returned code source {citation} to internal draft."),
    );
    Ok(format!(
        "{title} is no longer visible in Resident/Public search."
    ))
}

fn create_code_handoff(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let source_index = selected_code_source_index(state, payload)?;
    let source = &state.code_sources[source_index];
    let summary = payload_optional_string(payload, "summary");
    let id = new_id("handoff", state.code_handoffs.len());
    state.code_handoffs.insert(
        0,
        CodeHandoff {
            id,
            source_id: source.id.clone(),
            title: format!("Clerk handoff: {}", source.title),
            summary: if summary.is_empty() {
                format!(
                    "Review {} for ordinance or resolution workflow.",
                    source.citation
                )
            } else {
                summary
            },
            status: "ready for clerk review".to_string(),
            created_at_unix_seconds: now_unix_seconds(),
        },
    );
    push_audit(
        state,
        "civiccode",
        "create-code-handoff",
        format!("Created code-to-clerk handoff from {}", source.citation),
    );
    Ok("Code handoff created for CivicClerk review.".to_string())
}

fn contains_query(values: &[&str], query: &str) -> bool {
    let query = query.to_lowercase();
    values
        .iter()
        .any(|value| value.to_lowercase().contains(&query))
}

fn contains_question_terms(values: &[&str], query: &str) -> bool {
    if contains_query(values, query) {
        return true;
    }
    let terms = query
        .split(|character: char| !character.is_ascii_alphanumeric())
        .map(str::to_lowercase)
        .filter(|term| term.len() > 2)
        .collect::<Vec<_>>();
    values.iter().any(|value| {
        let value = value.to_lowercase();
        terms.iter().any(|term| value.contains(term))
    })
}

fn answer_code_question(
    state: &CityWorkState,
    query: &str,
    public_only: bool,
) -> Vec<SearchResult> {
    let query = query.trim();
    if query.is_empty() {
        return Vec::new();
    }
    state
        .code_sources
        .iter()
        .filter(|source| !public_only || source.public_status == "published")
        .filter(|source| source.stale_since_unix_seconds.is_none())
        .filter(|source| {
            let mut fields: Vec<&str> = vec![
                source.title.as_str(),
                source.citation.as_str(),
                source.body.as_str(),
                source.plain_language_summary.as_str(),
            ];
            if !public_only {
                fields.push(source.staff_guidance.as_str());
            }
            contains_question_terms(&fields, query)
        })
        .take(3)
        .map(|source| {
            let public_summary_allowed = source.guidance_approved_at_unix_seconds.is_some()
                && !source.plain_language_summary.trim().is_empty();
            let staff_detail_allowed = !public_only && !source.staff_guidance.trim().is_empty();
            let answer = if public_summary_allowed {
                source.plain_language_summary.clone()
            } else if staff_detail_allowed {
                source.staff_guidance.clone()
            } else {
                source.body
                    .split('.')
                    .next()
                    .map(str::trim)
                    .filter(|value| !value.is_empty())
                    .map(|value| format!("{value}."))
                    .unwrap_or_else(|| source.body.clone())
            };
            let label = if public_only {
                "Non-authoritative public summary"
            } else {
                "Staff code guidance"
            };
            SearchResult {
                module_id: "civiccode".to_string(),
                record_id: source.id.clone(),
                title: format!("Code answer: {}", source.title),
                snippet: format!(
                    "{label}: {answer} This is not legal advice; confirm interpretation with city staff or counsel."
                ),
                citation: source.citation.clone(),
                status: source.public_status.clone(),
            }
        })
        .collect()
}

pub fn search_city_work(state: &CityWorkState, query: &str) -> Vec<SearchResult> {
    let query = query.trim();
    if query.is_empty() {
        return Vec::new();
    }
    let mut results = Vec::new();
    for meeting in &state.meetings {
        let agenda_titles = meeting
            .agenda_items
            .iter()
            .map(|item| item.title.as_str())
            .collect::<Vec<_>>()
            .join(" ");
        let votes = meeting.votes.join(" ");
        let action_items = meeting.action_items.join(" ");
        let resident_comments = meeting.resident_comments.join(" ");
        let notice_checklists = meeting
            .notice_checklists
            .iter()
            .map(|checklist| {
                format!(
                    "{} {} {} {} {}",
                    checklist.meeting_type,
                    checklist.statutory_basis,
                    checklist.posting_deadline,
                    checklist.time_zone,
                    checklist.status
                )
            })
            .collect::<Vec<_>>()
            .join(" ");
        let notice_postings = meeting
            .notice_postings
            .iter()
            .map(|posting| {
                format!(
                    "{} {} {} {} {}",
                    posting.location,
                    posting.method,
                    posting.confirmation,
                    posting.posted_on,
                    posting.time_zone
                )
            })
            .collect::<Vec<_>>()
            .join(" ");
        let public_comments = meeting
            .public_comments
            .iter()
            .map(|comment| {
                format!(
                    "{} {} {} {} {}",
                    comment.commenter_name,
                    comment.commenter_contact,
                    comment.mode,
                    comment.topic,
                    comment.body
                )
            })
            .collect::<Vec<_>>()
            .join(" ");
        if contains_query(
            &[
                &meeting.title,
                &meeting.summary,
                &meeting.status,
                &meeting.minutes,
                &agenda_titles,
                &votes,
                &action_items,
                &resident_comments,
                &notice_checklists,
                &notice_postings,
                &public_comments,
            ],
            query,
        ) {
            results.push(SearchResult {
                module_id: "civicclerk".to_string(),
                record_id: meeting.id.clone(),
                title: meeting.title.clone(),
                snippet: meeting.summary.clone(),
                citation: format!("Meeting {}", meeting.meeting_date),
                status: meeting.status.clone(),
            });
        }
    }
    for request in &state.records_requests {
        let citations = request.citations.join(" ");
        let clarification_notes = request.clarification_notes.join(" ");
        let search_notes = request.search_notes.join(" ");
        let exemption_reviews = request.exemption_reviews.join(" ");
        let approval_notes = request.approval_notes.join(" ");
        let timeline = request
            .timeline
            .iter()
            .map(|entry| format!("{} {} {}", entry.action, entry.actor, entry.note))
            .collect::<Vec<_>>()
            .join(" ");
        if contains_query(
            &[
                &request.requester,
                &request.summary,
                &request.status,
                &request.assigned_to,
                &request.deadline,
                &request.deadline_basis,
                &request.fee_estimate,
                &request.response_draft,
                &citations,
                &clarification_notes,
                &search_notes,
                &exemption_reviews,
                &approval_notes,
                &timeline,
            ],
            query,
        ) {
            results.push(SearchResult {
                module_id: "civicrecords-ai".to_string(),
                record_id: request.id.clone(),
                title: format!("Records request: {}", request.requester),
                snippet: request.summary.clone(),
                citation: request
                    .citations
                    .first()
                    .cloned()
                    .unwrap_or_else(|| "Local records request".to_string()),
                status: request.status.clone(),
            });
        }
    }
    for source in &state.code_sources {
        let amendment_notes = source.amendment_notes.join(" ");
        let sync_errors = source.codifier_sync_errors.join(" ");
        let version_history = code_version_history_search_text(&source.version_history);
        if contains_query(
            &[
                &source.title,
                &source.citation,
                &source.body,
                &source.status,
                &source.public_status,
                &source.codifier_name,
                &source.authoritative_url,
                &source.version_label,
                &source.codifier_sync_status,
                &source.staff_guidance,
                &source.plain_language_summary,
                &amendment_notes,
                &sync_errors,
                &version_history,
            ],
            query,
        ) {
            results.push(SearchResult {
                module_id: "civiccode".to_string(),
                record_id: source.id.clone(),
                title: source.title.clone(),
                snippet: source.body.clone(),
                citation: source.citation.clone(),
                status: source.status.clone(),
            });
        }
    }
    for event in &state.notification_events {
        if contains_query(
            &[
                &event.module_id,
                &event.record_id,
                &event.audience,
                &event.channel,
                &event.subject,
                &event.body,
                &event.status,
            ],
            query,
        ) {
            results.push(SearchResult {
                module_id: "civiccore".to_string(),
                record_id: event.id.clone(),
                title: format!("Notification: {}", event.subject),
                snippet: event.body.clone(),
                citation: event.channel.clone(),
                status: event.status.clone(),
            });
        }
    }
    results
}

pub fn city_work_state() -> Result<CityWorkState, String> {
    read_state()
}

fn public_comment_projection(comment: &PublicComment) -> Option<PublicComment> {
    if comment.status != "reviewed for public record"
        && comment.status != "redacted for public record"
    {
        return None;
    }
    let mut public_comment = comment.clone();
    public_comment.commenter_contact.clear();
    if public_comment.status == "redacted for public record"
        && !public_comment.redacted_body.is_empty()
    {
        public_comment.body = public_comment.redacted_body.clone();
    }
    Some(public_comment)
}

fn public_meeting_projection(meeting: &Meeting) -> Option<Meeting> {
    let is_public_notice = meeting.notice_status == "public notice ready";
    let is_public_archive =
        meeting.status == "archived public record" || meeting.archived_at_unix_seconds.is_some();
    if !is_public_notice && !is_public_archive {
        return None;
    }
    let mut public_meeting = meeting.clone();
    public_meeting.public_comments = meeting
        .public_comments
        .iter()
        .filter_map(public_comment_projection)
        .collect();
    if !is_public_archive {
        public_meeting.minutes.clear();
        public_meeting.votes.clear();
        public_meeting.action_items.clear();
        public_meeting.resident_comments.clear();
        public_meeting.exports.clear();
    }
    Some(public_meeting)
}

fn public_records_request_projection(request: &RecordsRequest) -> Option<RecordsRequest> {
    let is_released = request.status == "fulfilled"
        || request.status == "closed"
        || request.fulfilled_at_unix_seconds.is_some();
    if !is_released {
        return None;
    }
    Some(public_records_request_status_projection(request))
}

fn public_records_request_status_projection(request: &RecordsRequest) -> RecordsRequest {
    let mut public_request = request.clone();
    public_request.requester_contact.clear();
    public_request.assigned_to.clear();
    public_request.clarification_notes.clear();
    public_request.search_notes.clear();
    public_request.exemption_reviews.clear();
    public_request.fee_estimate.clear();
    public_request.response_draft.clear();
    public_request.approval_notes.clear();
    public_request.timeline.clear();
    public_request
}

fn public_records_status_lookup(
    state: &CityWorkState,
    payload: Option<&Value>,
) -> Result<CityWorkActionResult, String> {
    let tracking_number = payload_string(payload, "trackingNumber")?;
    let requester_contact = payload_string(payload, "requesterContact")?;
    let normalized_tracking = tracking_number.trim().to_ascii_lowercase();
    let normalized_contact = requester_contact.trim().to_ascii_lowercase();
    let mut public_state = city_work_public_projection(state);
    let found_request = state.records_requests.iter().find(|request| {
        request.public_tracking_number.to_ascii_lowercase() == normalized_tracking
            && request.requester_contact.to_ascii_lowercase() == normalized_contact
    });
    if let Some(request) = found_request {
        let projected_request = public_records_request_status_projection(request);
        if !public_state
            .records_requests
            .iter()
            .any(|public_request| public_request.id == projected_request.id)
        {
            public_state.records_requests.insert(0, projected_request);
        }
        return Ok(CityWorkActionResult {
            accepted: true,
            action: "lookup-public-records-request".to_string(),
            status: "Status found",
            message: format!(
                "Request {tracking_number} matched the submitted contact and is ready to review."
            ),
            next_action:
                "Review the current status below or contact staff with the request number."
                    .to_string(),
            state: public_state,
            search_results: Vec::new(),
        });
    }
    Ok(CityWorkActionResult {
        accepted: false,
        action: "lookup-public-records-request".to_string(),
        status: "No match",
        message: "No local request matched that request number and submitted contact.".to_string(),
        next_action: "Check the request number and contact, or contact the clerk if you need help."
            .to_string(),
        state: public_state,
        search_results: Vec::new(),
    })
}

fn public_code_source_projection(source: &CodeSource) -> Option<CodeSource> {
    if source.public_status != "published" {
        return None;
    }
    let mut public_source = source.clone();
    public_source.staff_guidance.clear();
    public_source.codifier_sync_errors.clear();
    public_source.amendment_notes.clear();
    for entry in &mut public_source.version_history {
        entry.note.clear();
    }
    if public_source.guidance_approved_at_unix_seconds.is_none() {
        public_source.plain_language_summary.clear();
    }
    Some(public_source)
}

pub(crate) fn city_work_public_projection(state: &CityWorkState) -> CityWorkState {
    CityWorkState {
        meetings: state
            .meetings
            .iter()
            .filter_map(public_meeting_projection)
            .collect(),
        records_requests: state
            .records_requests
            .iter()
            .filter_map(public_records_request_projection)
            .collect(),
        code_sources: state
            .code_sources
            .iter()
            .filter_map(public_code_source_projection)
            .collect(),
        code_handoffs: Vec::new(),
        audit_entries: Vec::new(),
        publication_events: state
            .publication_events
            .iter()
            .filter(|event| event.retracted_at_unix_seconds.is_none())
            .cloned()
            .collect(),
        notification_events: Vec::new(),
    }
}

pub fn public_city_work_state() -> Result<CityWorkState, String> {
    read_state().map(|state| city_work_public_projection(&state))
}

pub(crate) fn city_work_action_allows_public(action: &str) -> bool {
    matches!(
        action,
        "submit-public-comment"
            | "submit-public-records-request"
            | "lookup-public-records-request"
            | "answer-code-question"
    )
}

pub fn city_work_action(
    action: &str,
    payload: Option<&Value>,
) -> Result<CityWorkActionResult, String> {
    let mut state = read_state()?;
    let mut search_results = Vec::new();
    let message = match action {
        "create-meeting" => create_meeting(&mut state, payload)?,
        "add-agenda-item" => add_agenda_item(&mut state, payload)?,
        "add-code-handoff-agenda" => add_code_handoff_agenda(&mut state, payload)?,
        "complete-notice-checklist" => complete_notice_checklist(&mut state, payload)?,
        "post-notice" => post_notice(&mut state, payload)?,
        "record-minutes" => record_minutes(&mut state, payload)?,
        "suggest-minutes-draft" => suggest_minutes_draft(&mut state, payload)?,
        "record-vote" => record_vote(&mut state, payload)?,
        "add-action-item" => add_action_item(&mut state, payload)?,
        "record-resident-comment" => record_resident_comment(&mut state, payload)?,
        "submit-public-comment" => submit_public_comment(&mut state, payload)?,
        "review-public-comment" => review_public_comment(&mut state, payload)?,
        "redact-public-comment" => redact_public_comment(&mut state, payload)?,
        "adopt-minutes" => adopt_minutes(&mut state, payload)?,
        "export-meeting-packet" => export_meeting_packet(&mut state, payload)?,
        "archive-meeting" => archive_meeting(&mut state, payload)?,
        "create-records-request" => create_records_request(&mut state, payload)?,
        "submit-public-records-request" => submit_public_records_request(&mut state, payload)?,
        "lookup-public-records-request" => return public_records_status_lookup(&state, payload),
        "set-records-deadline" => set_records_deadline(&mut state, payload)?,
        "request-records-clarification" => request_records_clarification(&mut state, payload)?,
        "assign-records-request" => assign_records_request(&mut state, payload)?,
        "record-records-search" => record_records_search(&mut state, payload)?,
        "add-records-exemption-review" => add_records_exemption_review(&mut state, payload)?,
        "estimate-records-fee" => estimate_records_fee(&mut state, payload)?,
        "suggest-records-response" => suggest_records_response(&mut state, payload)?,
        "draft-records-response" => draft_records_response(&mut state, payload)?,
        "approve-records-response" => approve_records_response(&mut state, payload)?,
        "export-records-response" => export_records_response(&mut state, payload)?,
        "fulfill-records-request" => fulfill_records_request(&mut state, payload)?,
        "close-records-request" => close_records_request(&mut state, payload)?,
        "mark-notification-sent" => mark_notification_sent(&mut state, payload)?,
        "open-exports-folder" => open_exports_folder(payload)?,
        "import-code-source" => import_code_source(&mut state, payload)?,
        "record-codifier-sync" => record_codifier_sync(&mut state, payload)?,
        "record-codifier-sync-failure" => record_codifier_sync_failure(&mut state, payload)?,
        "retry-codifier-sync" => retry_codifier_sync(&mut state, payload)?,
        "mark-code-stale" => mark_code_stale(&mut state, payload)?,
        "suggest-code-guidance" => suggest_code_guidance(&mut state, payload)?,
        "draft-code-guidance" => draft_code_guidance(&mut state, payload)?,
        "approve-code-guidance" => approve_code_guidance(&mut state, payload)?,
        "publish-code-source" => publish_code_source(&mut state, payload)?,
        "unpublish-code-source" => unpublish_code_source(&mut state, payload)?,
        "create-code-handoff" => create_code_handoff(&mut state, payload)?,
        "answer-code-question" => {
            let query = payload_string(payload, "query")?;
            let public_only = payload_bool(payload, "publicOnly");
            search_results = answer_code_question(&state, &query, public_only);
            push_audit(
                &mut state,
                "civiccode",
                "answer-code-question",
                format!(
                    "Answered {}code question with {} cited result(s): {query}",
                    if public_only { "public " } else { "staff " },
                    search_results.len()
                ),
            );
            if search_results.is_empty() {
                "No current cited code source matched the question. Import, sync, publish, or refine source text before answering.".to_string()
            } else {
                "CivicCode answer generated from local cited source text.".to_string()
            }
        }
        "search-city-knowledge" => {
            let query = payload_string(payload, "query")?;
            search_results = search_city_work(&state, &query);
            push_audit(
                &mut state,
                "civiccore",
                "search-city-knowledge",
                format!("Searched local city knowledge for: {query}"),
            );
            "Local search completed across meetings, records, and code.".to_string()
        }
        _ => return Err(format!("Unsupported city workflow action: {action}")),
    };
    write_state(&state)?;
    Ok(CityWorkActionResult {
        accepted: true,
        action: action.to_string(),
        status: "Saved",
        message,
        next_action: "Continue the workflow or review the audit trail.".to_string(),
        state,
        search_results,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    fn with_temp_state_dir<T>(test: impl FnOnce(PathBuf) -> T) -> T {
        let _guard = crate::first_run::test_env_lock()
            .lock()
            .expect("test env lock");
        let root = env::temp_dir().join(format!(
            "civicsuite-desktop-workflows-test-{}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&root);
        env::set_var("CIVICSUITE_DESKTOP_STATE_DIR", &root);
        let result = test(root.clone());
        env::remove_var("CIVICSUITE_DESKTOP_STATE_DIR");
        let _ = fs::remove_dir_all(root);
        result
    }

    fn assert_valid_audit_chain(entries: &[AuditEntry]) {
        assert!(!entries.is_empty());
        for (index, entry) in entries.iter().enumerate() {
            let expected_previous = if index == 0 {
                "GENESIS".to_string()
            } else {
                entries[index - 1].entry_hash.clone()
            };
            assert_eq!(entry.previous_hash, expected_previous);
            assert_eq!(entry.entry_hash.len(), 64);
            assert_eq!(
                entry.entry_hash,
                audit_entry_hash(
                    &entry.previous_hash,
                    &entry.id,
                    &entry.module_id,
                    &entry.action,
                    &entry.summary,
                    entry.created_at_unix_seconds
                )
            );
        }
    }

    fn assert_export_integrity_manifest(export_path: &str, contents: &str) {
        let export_path = PathBuf::from(export_path);
        let manifest_path = export_manifest_path(&export_path);
        assert!(manifest_path.is_file());
        let manifest: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(manifest_path).expect("manifest reads"))
                .expect("manifest parses");
        let expected_export_path = export_path.to_string_lossy().to_string();
        let expected_hash = hash_public_payload(contents);
        assert_eq!(manifest["schema_version"].as_u64(), Some(1));
        assert_eq!(
            manifest["export_path"].as_str(),
            Some(expected_export_path.as_str())
        );
        assert_eq!(manifest["format"].as_str(), Some("markdown"));
        assert_eq!(manifest["size_bytes"].as_u64(), Some(contents.len() as u64));
        assert_eq!(manifest["sha256"].as_str(), Some(expected_hash.as_str()));
        assert_eq!(
            manifest["generated_by"].as_str(),
            Some("CivicSuite Windows Local")
        );
    }

    #[test]
    fn export_folder_action_opens_only_allowlisted_local_export_folders() {
        with_temp_state_dir(|root| {
            let records_folder = serde_json::json!({ "folder": "records" });
            let result = city_work_action("open-exports-folder", Some(&records_folder))
                .expect("exports folder opens");
            assert!(result.accepted);
            assert!(result.message.contains("records exports"));
            assert!(root.join("Data").join("exports").join("records").is_dir());

            let blocked_folder = serde_json::json!({ "folder": "..\\Windows" });
            let error = match city_work_action("open-exports-folder", Some(&blocked_folder)) {
                Ok(_) => panic!("unexpectedly opened a non-allowlisted export folder"),
                Err(error) => error,
            };
            assert!(error.contains("Choose a valid export folder"));
        });
    }

    #[test]
    fn meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive() {
        with_temp_state_dir(|_| {
            let payload = serde_json::json!({
                "title": "Council Regular Meeting",
                "meetingDate": "2026-07-01",
                "summary": "Budget hearing",
                "agendaTitle": "Adopt budget ordinance"
            });
            city_work_action("create-meeting", Some(&payload)).expect("meeting created");
            let missing_checklist = match city_work_action("complete-notice-checklist", None) {
                Ok(_) => panic!("notice checklist cannot pass without evidence"),
                Err(error) => error,
            };
            assert!(missing_checklist.contains("Enter the meeting type"));
            let missing_basis = serde_json::json!({
                "noticeMeetingType": "Regular council meeting",
                "noticeDeadline": "2026-06-30",
                "noticeTimeZone": "America/Denver",
                "noticeHumanApproval": true
            });
            let error = match city_work_action("complete-notice-checklist", Some(&missing_basis)) {
                Ok(_) => panic!("notice checklist cannot pass without statutory basis"),
                Err(error) => error,
            };
            assert!(error.contains("statutory notice basis"));
            let bad_time_zone = serde_json::json!({
                "noticeMeetingType": "Regular council meeting",
                "noticeStatutoryBasis": "Municipal open meetings notice",
                "noticeDeadline": "2026-06-30",
                "noticeTimeZone": "Denver",
                "noticeHumanApproval": true
            });
            let error = match city_work_action("complete-notice-checklist", Some(&bad_time_zone)) {
                Ok(_) => panic!("notice checklist cannot pass with invalid timezone"),
                Err(error) => error,
            };
            assert!(error.contains("valid IANA time zone"));
            let missing_approval = serde_json::json!({
                "noticeMeetingType": "Regular council meeting",
                "noticeStatutoryBasis": "Municipal open meetings notice",
                "noticeDeadline": "2026-06-30",
                "noticeTimeZone": "America/Denver",
                "noticeHumanApproval": false
            });
            let error = match city_work_action("complete-notice-checklist", Some(&missing_approval))
            {
                Ok(_) => panic!("notice checklist cannot pass without clerk approval"),
                Err(error) => error,
            };
            assert!(error.contains("clerk must approve"));
            let checklist = serde_json::json!({
                "noticeMeetingType": "Regular council meeting",
                "noticeStatutoryBasis": "Municipal open meetings notice",
                "noticeDeadline": "2026-06-30",
                "noticeTimeZone": "America/Denver",
                "noticeHumanApproval": true
            });
            city_work_action("complete-notice-checklist", Some(&checklist))
                .expect("notice checklist approved");
            let late_notice = serde_json::json!({
                "postingLocation": "City Hall bulletin board and city website",
                "postingMethod": "Posted PDF and clerk attestation",
                "postingConfirmation": "Clerk confirmed posting after the statutory deadline.",
                "postingDate": "2026-07-01"
            });
            let error = match city_work_action("post-notice", Some(&late_notice)) {
                Ok(_) => panic!("late notice posting cannot mark notice ready"),
                Err(error) => error,
            };
            assert!(error.contains("after the notice checklist deadline"));
            let notice = serde_json::json!({
                "postingLocation": "City Hall bulletin board and city website",
                "postingMethod": "Posted PDF and clerk attestation",
                "postingConfirmation": "Clerk confirmed posting before the statutory deadline.",
                "postingDate": "2026-06-30"
            });
            city_work_action("post-notice", Some(&notice)).expect("notice prepared");
            let minutes = serde_json::json!({ "minutes": "Meeting called to order at 6:00 PM." });
            city_work_action("record-minutes", Some(&minutes)).expect("minutes saved");
            let vote = serde_json::json!({ "vote": "Budget ordinance passed 4-1." });
            city_work_action("record-vote", Some(&vote)).expect("vote saved");
            let action_item =
                serde_json::json!({ "actionItem": "Finance staff to publish the adopted budget." });
            city_work_action("add-action-item", Some(&action_item)).expect("action item saved");
            let resident_comment =
                serde_json::json!({ "residentComment": "Resident asked for sidewalk funding." });
            city_work_action("record-resident-comment", Some(&resident_comment))
                .expect("resident comment saved");
            env::set_var(
                "CIVICSUITE_FAKE_MODEL_RESPONSE",
                "Local AI minutes draft: budget ordinance passed 4-1 with finance publication action.",
            );
            let suggested =
                city_work_action("suggest-minutes-draft", None).expect("AI minutes generated");
            env::remove_var("CIVICSUITE_FAKE_MODEL_RESPONSE");
            assert!(suggested.message.contains("Local AI minutes draft"));
            let suggested_state = city_work_state().expect("state reads after AI minutes");
            assert!(suggested_state.meetings[0]
                .minutes
                .contains("Local AI minutes draft"));
            city_work_action("adopt-minutes", None).expect("minutes adopted");
            city_work_action("export-meeting-packet", None).expect("packet exported");
            city_work_action("archive-meeting", None).expect("meeting archived");
            let state = city_work_state().expect("state reads");
            let meeting = state.meetings.first().expect("meeting exists");
            assert_eq!(meeting.notice_status, "public notice ready");
            assert_eq!(meeting.notice_checklists.len(), 1);
            assert_eq!(
                meeting.notice_checklists[0].statutory_basis,
                "Municipal open meetings notice"
            );
            assert_eq!(meeting.notice_postings.len(), 1);
            assert_eq!(
                meeting.notice_postings[0].location,
                "City Hall bulletin board and city website"
            );
            assert_eq!(meeting.notice_postings[0].posted_on, "2026-06-30");
            assert_eq!(meeting.status, "archived public record");
            assert_eq!(meeting.votes.len(), 1);
            assert_eq!(meeting.action_items.len(), 1);
            assert_eq!(meeting.resident_comments.len(), 1);
            assert!(meeting.minutes_adopted_at_unix_seconds.is_some());
            assert!(meeting.archived_at_unix_seconds.is_some());
            assert_eq!(meeting.exports.len(), 2);
            assert_ne!(meeting.exports[0], meeting.exports[1]);
            assert!(PathBuf::from(&meeting.exports[0]).is_file());
            assert!(PathBuf::from(&meeting.exports[1]).is_file());
            let packet = fs::read_to_string(&meeting.exports[0]).expect("packet reads");
            assert_export_integrity_manifest(&meeting.exports[0], &packet);
            let archive = fs::read_to_string(&meeting.exports[1]).expect("archive reads");
            assert_export_integrity_manifest(&meeting.exports[1], &archive);
            assert!(archive.contains("## Notice Checklist"));
            assert!(archive.contains("Municipal open meetings notice"));
            assert!(archive.contains("## Notice Posting Evidence"));
            assert!(archive.contains("City Hall bulletin board and city website"));
            assert!(archive.contains("Local AI minutes draft"));
            assert!(archive.contains("## Action Items"));
            assert!(archive.contains("Finance staff to publish the adopted budget."));
            assert!(archive.contains("## Staff-Entered Resident Comments"));
            assert!(archive.contains("Resident asked for sidewalk funding."));
            assert!(state
                .audit_entries
                .iter()
                .any(|entry| entry.action == "archive-meeting"));
            let publication = state
                .publication_events
                .iter()
                .find(|event| event.record_type == "meeting-archive")
                .expect("meeting archive publication event exists");
            assert_eq!(publication.source_module, "civicclerk");
            assert_eq!(publication.source_record_id, meeting.id);
            assert_eq!(publication.payload_hash.len(), 64);
            assert!(publication.retracted_at_unix_seconds.is_none());
            assert!(state.audit_entries.len() >= 10);
            assert_valid_audit_chain(&state.audit_entries);

            let late_vote = serde_json::json!({ "vote": "Late amendment after archive." });
            let error = match city_work_action("record-vote", Some(&late_vote)) {
                Ok(_) => panic!("archived meeting cannot be mutated"),
                Err(error) => error,
            };
            assert!(error.contains("archived as a public record"));

            city_work_action("export-meeting-packet", None).expect("archived packet can re-export");
            let reloaded = city_work_state().expect("state reads after re-export");
            let reloaded_meeting = reloaded.meetings.first().expect("meeting exists");
            assert_eq!(reloaded_meeting.status, "archived public record");
            assert_eq!(reloaded_meeting.exports.len(), 3);
        });
    }

    #[test]
    fn public_comment_intake_requires_posted_meeting_and_is_preserved() {
        with_temp_state_dir(|_| {
            let payload = serde_json::json!({
                "title": "Council Hearing",
                "meetingDate": "2026-07-15",
                "summary": "Sidewalk tree ordinance hearing",
                "agendaTitle": "Discuss sidewalk tree ordinance"
            });
            city_work_action("create-meeting", Some(&payload)).expect("meeting created");
            let state = city_work_state().expect("state reads");
            let meeting_id = state.meetings.first().expect("meeting exists").id.clone();
            let public_comment = serde_json::json!({
                "meetingId": meeting_id.clone(),
                "commenterName": "Jordan Smith",
                "commenterContact": "jordan@example.gov",
                "commentMode": "remote",
                "commentTopic": "Agenda item: sidewalk trees",
                "commentBody": "Please preserve the mature trees on Maple Avenue."
            });
            let error = match city_work_action("submit-public-comment", Some(&public_comment)) {
                Ok(_) => panic!("comment cannot be submitted before public posting"),
                Err(error) => error,
            };
            assert!(error.contains("Public comments open only after"));

            city_work_action(
                "complete-notice-checklist",
                Some(&serde_json::json!({
                    "meetingId": meeting_id.clone(),
                    "noticeMeetingType": "Public hearing",
                    "noticeStatutoryBasis": "Municipal hearing notice",
                    "noticeDeadline": "2026-07-14",
                    "noticeTimeZone": "America/Denver",
                    "noticeHumanApproval": true
                })),
            )
            .expect("notice checklist approved");
            city_work_action(
                "post-notice",
                Some(&serde_json::json!({
                    "meetingId": meeting_id.clone(),
                    "postingLocation": "City website",
                    "postingMethod": "Meeting notice web posting",
                    "postingConfirmation": "Clerk confirmed website posting.",
                    "postingDate": "2026-07-14"
                })),
            )
            .expect("notice posted");
            city_work_action("submit-public-comment", Some(&public_comment))
                .expect("public comment saved");
            let state = city_work_state().expect("state reads after comment");
            let comment_id = state
                .meetings
                .first()
                .expect("meeting exists")
                .public_comments
                .first()
                .expect("comment exists")
                .id
                .clone();
            let review = serde_json::json!({
                "meetingId": meeting_id.clone(),
                "publicCommentId": comment_id.clone()
            });
            city_work_action("review-public-comment", Some(&review)).expect("comment reviewed");
            let redaction = serde_json::json!({
                "meetingId": meeting_id.clone(),
                "publicCommentId": comment_id,
                "redactedBody": "Please preserve the mature street trees.",
                "redactionBasis": "Personally identifying information"
            });
            city_work_action("redact-public-comment", Some(&redaction)).expect("comment redacted");
            city_work_action(
                "export-meeting-packet",
                Some(&serde_json::json!({ "meetingId": meeting_id })),
            )
            .expect("packet exported");

            let state = city_work_state().expect("state reads");
            let meeting = state.meetings.first().expect("meeting exists");
            assert_eq!(meeting.public_comments.len(), 1);
            let comment = meeting.public_comments.first().expect("comment exists");
            assert_eq!(comment.commenter_name, "Jordan Smith");
            assert_eq!(comment.commenter_contact, "jordan@example.gov");
            assert_eq!(comment.mode, "remote");
            assert_eq!(comment.status, "redacted for public record");
            assert_eq!(
                comment.redacted_body,
                "Please preserve the mature street trees."
            );
            assert_eq!(
                comment.redaction_basis,
                "Personally identifying information"
            );
            assert!(comment.reviewed_at_unix_seconds.is_some());
            assert!(comment.redacted_at_unix_seconds.is_some());
            let exported = fs::read_to_string(meeting.exports.first().expect("export exists"))
                .expect("export reads");
            assert!(exported.contains("## Public Comments"));
            assert!(exported.contains("Please preserve the mature street trees."));
            assert!(exported.contains("Redaction basis: Personally identifying information"));
            assert!(!exported.contains("Maple Avenue"));
            let results = search_city_work(&state, "Maple Avenue");
            assert_eq!(results.len(), 1);
            assert!(state.audit_entries.iter().any(|entry| {
                entry.module_id == "civicclerk" && entry.action == "submit-public-comment"
            }));
            assert!(state
                .audit_entries
                .iter()
                .any(|entry| entry.action == "review-public-comment"));
            assert!(state.audit_entries.iter().any(|entry| {
                entry.action == "redact-public-comment"
                    && entry.summary.contains("Personally identifying information")
            }));
            assert_valid_audit_chain(&state.audit_entries);
        });
    }

    #[test]
    fn records_workflow_requires_human_approval_before_release() {
        with_temp_state_dir(|_| {
            let payload = serde_json::json!({
                "requester": "Alex Rivera",
                "summary": "Emails about park contract",
                "deadline": "2026-07-10"
            });
            city_work_action("create-records-request", Some(&payload)).expect("request created");
            let clarification = serde_json::json!({
                "clarificationNote": "Asked requester to narrow the date range."
            });
            city_work_action("request-records-clarification", Some(&clarification))
                .expect("clarification saved");
            let assignment = serde_json::json!({ "assignedTo": "Records Officer" });
            city_work_action("assign-records-request", Some(&assignment)).expect("assigned");
            let search = serde_json::json!({
                "sourceNote": "Searched parks shared drive and clerk email journal.",
                "citation": "PRA-2026-001"
            });
            city_work_action("record-records-search", Some(&search)).expect("search saved");
            env::set_var(
                "CIVICSUITE_FAKE_MODEL_RESPONSE",
                "Local AI draft response for responsive park contract records.",
            );
            let suggested =
                city_work_action("suggest-records-response", None).expect("AI draft generated");
            env::remove_var("CIVICSUITE_FAKE_MODEL_RESPONSE");
            assert!(suggested.message.contains("Local AI records draft"));
            let suggested_state = city_work_state().expect("state reads after AI draft");
            assert!(suggested_state.records_requests[0]
                .response_draft
                .contains("Local AI draft response"));
            let exemption = serde_json::json!({
                "exemptionNote": "Reviewed attorney-client content; no auto-redaction applied."
            });
            city_work_action("add-records-exemption-review", Some(&exemption))
                .expect("exemption saved");
            let fee = serde_json::json!({ "feeEstimate": "$12.50 staff time estimate" });
            city_work_action("estimate-records-fee", Some(&fee)).expect("fee saved");
            let draft = serde_json::json!({
                "responseDraft": "Responsive records are attached for review.",
                "citation": "PRA-2026-002"
            });
            city_work_action("draft-records-response", Some(&draft)).expect("draft saved");
            let error = match city_work_action("export-records-response", None) {
                Ok(_) => panic!("records response cannot export before human approval"),
                Err(error) => error,
            };
            assert!(error.contains("Approve the records response"));
            let approval = serde_json::json!({ "approvalNote": "Reviewed and approved by clerk." });
            city_work_action("approve-records-response", Some(&approval)).expect("approved");
            city_work_action("export-records-response", None).expect("export saved");
            city_work_action("fulfill-records-request", None).expect("fulfilled");
            city_work_action("close-records-request", None).expect("closed");
            let state = city_work_state().expect("state reads");
            let request = state.records_requests.first().expect("request exists");
            assert_eq!(request.status, "closed");
            assert_eq!(request.deadline_basis, "Staff-entered deadline at intake.");
            assert_eq!(request.assigned_to, "Records Officer");
            assert_eq!(request.clarification_notes.len(), 1);
            assert_eq!(request.search_notes.len(), 1);
            assert_eq!(request.exemption_reviews.len(), 1);
            assert_eq!(request.fee_estimate, "$12.50 staff time estimate");
            assert!(request.approved_at_unix_seconds.is_some());
            assert!(request.fulfilled_at_unix_seconds.is_some());
            assert!(request.closed_at_unix_seconds.is_some());
            assert_eq!(request.exports.len(), 1);
            assert!(request
                .timeline
                .iter()
                .any(|entry| entry.action == "clarification requested"));
            assert!(request
                .timeline
                .iter()
                .any(|entry| entry.action == "response approved"));
            assert!(request
                .timeline
                .iter()
                .any(|entry| entry.action == "fulfilled"));
            assert!(request
                .timeline
                .iter()
                .any(|entry| entry.action == "closed"));
            assert!(PathBuf::from(&request.exports[0]).is_file());
            let exported = fs::read_to_string(&request.exports[0]).expect("export reads");
            assert_export_integrity_manifest(&request.exports[0], &exported);
            assert!(exported.contains("Deadline basis: Staff-entered deadline at intake."));
            assert!(exported.contains("## Request Timeline"));
            assert!(exported.contains("clarification requested"));
            assert!(exported.contains("response approved"));
            assert!(exported.contains("## Exemption Review"));
            assert!(exported.contains("Reviewed attorney-client content"));
            assert!(exported.contains("## Approval Notes"));
            let publication = state
                .publication_events
                .iter()
                .find(|event| event.record_type == "records-response")
                .expect("records response publication event exists");
            assert_eq!(publication.source_module, "civicrecords-ai");
            assert_eq!(publication.source_record_id, request.id);
            assert_eq!(publication.payload_hash.len(), 64);
            assert!(publication.retracted_at_unix_seconds.is_none());
            assert!(state.notification_events.iter().any(|event| {
                event.audience == "requester"
                    && event.subject.contains("response ready")
                    && event.body.contains("Export package")
            }));
            assert!(state.notification_events.iter().any(|event| {
                event.audience == "records staff"
                    && event.subject.contains("closed")
                    && event.status == "ready to send"
            }));
            let results = search_city_work(&state, "attorney-client");
            assert_eq!(results.len(), 1);
            let timeline_results = search_city_work(&state, "clarification requested");
            assert_eq!(timeline_results.len(), 1);
            let notification_results = search_city_work(&state, "response ready");
            assert_eq!(notification_results.len(), 1);
            assert_eq!(notification_results[0].module_id, "civiccore");
        });
    }

    #[test]
    fn public_records_intake_creates_trackable_durable_request() {
        with_temp_state_dir(|_| {
            let payload = serde_json::json!({
                "requester": "Morgan Lee",
                "requesterContact": "morgan@example.gov",
                "summary": "Emails and invoices about the river trail grant"
            });
            let result = city_work_action("submit-public-records-request", Some(&payload))
                .expect("public request submitted");
            assert!(result.message.contains("REQ-0001"));

            let state = city_work_state().expect("state reads");
            let request = state.records_requests.first().expect("request exists");
            assert_eq!(request.public_tracking_number, "REQ-0001");
            assert_eq!(request.requester, "Morgan Lee");
            assert_eq!(request.requester_contact, "morgan@example.gov");
            assert_eq!(request.submitted_via, "Resident/Public local intake");
            assert_eq!(request.status, "public intake received");
            assert_eq!(request.deadline, "Pending clerk deadline review");
            assert!(request.deadline_basis.is_empty());
            assert!(request.deadline_reviewed_at_unix_seconds.is_none());
            assert!(request.approved_at_unix_seconds.is_none());
            assert!(request.fulfilled_at_unix_seconds.is_none());
            assert_eq!(request.timeline.len(), 1);
            assert_eq!(request.timeline[0].action, "public intake");
            assert_eq!(state.notification_events.len(), 2);
            assert!(state.notification_events.iter().any(|event| {
                event.audience == "records staff"
                    && event
                        .subject
                        .contains("New public records request REQ-0001")
                    && event.status == "ready to send"
            }));
            assert!(state.notification_events.iter().any(|event| {
                event.audience == "requester"
                    && event.subject.contains("Records request REQ-0001 received")
                    && event.body.contains("morgan@example.gov")
            }));

            let missing_basis = serde_json::json!({
                "recordsRequestId": request.id.clone(),
                "deadline": "2026-07-20"
            });
            let error = match city_work_action("set-records-deadline", Some(&missing_basis)) {
                Ok(_) => panic!("deadline cannot be reviewed without basis"),
                Err(error) => error,
            };
            assert!(error.contains("statutory or policy basis"));
            let bad_deadline = serde_json::json!({
                "recordsRequestId": request.id.clone(),
                "deadline": "2026-02-31",
                "deadlineBasis": "Colorado CORA response deadline reviewed by clerk."
            });
            let error = match city_work_action("set-records-deadline", Some(&bad_deadline)) {
                Ok(_) => panic!("deadline cannot be invalid calendar date"),
                Err(error) => error,
            };
            assert!(error.contains("real calendar date"));
            let deadline_review = serde_json::json!({
                "recordsRequestId": request.id.clone(),
                "deadline": "2026-07-20",
                "deadlineBasis": "Colorado CORA response deadline reviewed by clerk."
            });
            city_work_action("set-records-deadline", Some(&deadline_review))
                .expect("deadline reviewed");
            let state = city_work_state().expect("state reads after deadline review");
            let request = state.records_requests.first().expect("request exists");
            assert_eq!(request.status, "deadline reviewed");
            assert_eq!(request.deadline, "2026-07-20");
            assert_eq!(
                request.deadline_basis,
                "Colorado CORA response deadline reviewed by clerk."
            );
            assert!(request.deadline_reviewed_at_unix_seconds.is_some());
            assert_eq!(request.timeline.len(), 2);
            assert!(request
                .timeline
                .iter()
                .any(|entry| entry.action == "deadline reviewed"));
            assert_eq!(state.notification_events.len(), 3);
            let deadline_notification = state
                .notification_events
                .iter()
                .find(|event| event.subject.contains("deadline reviewed"))
                .expect("deadline notification exists");
            assert_eq!(deadline_notification.audience, "requester");
            assert_eq!(deadline_notification.status, "ready to send");
            let deadline_notification_id = deadline_notification.id.clone();
            let public_state = public_city_work_state().expect("public state reads");
            assert!(public_state.records_requests.is_empty());
            assert!(public_state.notification_events.is_empty());

            city_work_action(
                "mark-notification-sent",
                Some(&serde_json::json!({
                    "notificationId": deadline_notification_id
                })),
            )
            .expect("notification marked sent");
            let state = city_work_state().expect("state reads after notification log");
            let deadline_notification = state
                .notification_events
                .iter()
                .find(|event| event.subject.contains("deadline reviewed"))
                .expect("deadline notification exists");
            assert_eq!(deadline_notification.status, "sent / logged");
            assert!(deadline_notification.sent_at_unix_seconds.is_some());

            let lookup = serde_json::json!({
                "trackingNumber": "REQ-0001",
                "requesterContact": "MORGAN@example.gov"
            });
            let lookup_result = city_work_action("lookup-public-records-request", Some(&lookup))
                .expect("public lookup completes");
            assert_eq!(lookup_result.status, "Status found");
            assert_eq!(lookup_result.state.records_requests.len(), 1);
            let public_request = &lookup_result.state.records_requests[0];
            assert_eq!(public_request.public_tracking_number, "REQ-0001");
            assert_eq!(public_request.status, "deadline reviewed");
            assert_eq!(public_request.deadline, "2026-07-20");
            assert_eq!(
                public_request.deadline_basis,
                "Colorado CORA response deadline reviewed by clerk."
            );
            assert_eq!(public_request.requester_contact, "");
            assert_eq!(public_request.assigned_to, "");
            assert!(public_request.clarification_notes.is_empty());
            assert!(public_request.search_notes.is_empty());
            assert!(public_request.exemption_reviews.is_empty());
            assert_eq!(public_request.fee_estimate, "");
            assert_eq!(public_request.response_draft, "");
            assert!(public_request.approval_notes.is_empty());
            assert!(public_request.timeline.is_empty());

            let wrong_contact = serde_json::json!({
                "trackingNumber": "REQ-0001",
                "requesterContact": "wrong@example.gov"
            });
            let wrong_lookup =
                city_work_action("lookup-public-records-request", Some(&wrong_contact))
                    .expect("public lookup handles mismatch");
            assert!(!wrong_lookup.accepted);
            assert_eq!(wrong_lookup.status, "No match");
            assert!(wrong_lookup.state.records_requests.is_empty());
            let state = city_work_state().expect("state reads for audit");
            assert!(state.audit_entries.iter().any(|entry| {
                entry.module_id == "civicrecords-ai"
                    && entry.action == "submit-public-records-request"
                    && entry.summary.contains("REQ-0001")
            }));
            assert!(state
                .audit_entries
                .iter()
                .any(|entry| entry.action == "set-records-deadline"));
            assert!(state.audit_entries.iter().any(|entry| {
                entry.action == "mark-notification-sent"
                    && entry.summary.contains("deadline reviewed")
            }));
            assert_valid_audit_chain(&state.audit_entries);
        });
    }

    #[test]
    fn code_workflow_persists_source_handoff_and_search() {
        with_temp_state_dir(|_| {
            let payload = serde_json::json!({
                "title": "Noise Ordinance",
                "citation": "CMC 8.12",
                "body": "Quiet hours begin at 10 PM."
            });
            city_work_action("import-code-source", Some(&payload)).expect("source imported");
            let failure = serde_json::json!({ "syncError": "Codifier export unavailable." });
            city_work_action("record-codifier-sync-failure", Some(&failure))
                .expect("sync failure recorded");
            city_work_action("retry-codifier-sync", None).expect("sync retry queued");
            let sync = serde_json::json!({
                "codifierName": "Municode",
                "authoritativeUrl": "https://example.gov/code/noise",
                "versionLabel": "2026-07 codifier export"
            });
            city_work_action("record-codifier-sync", Some(&sync)).expect("sync recorded");
            let stale = serde_json::json!({
                "amendmentNote": "Ordinance 2026-14 amended quiet hours; codifier update pending."
            });
            city_work_action("mark-code-stale", Some(&stale)).expect("stale marked");
            env::set_var(
                "CIVICSUITE_FAKE_MODEL_RESPONSE",
                "Local AI guidance draft about quiet hours and permit checks.",
            );
            let suggested =
                city_work_action("suggest-code-guidance", None).expect("AI guidance generated");
            env::remove_var("CIVICSUITE_FAKE_MODEL_RESPONSE");
            assert!(suggested.message.contains("Local AI code guidance"));
            let suggested_state = city_work_state().expect("state reads after AI guidance");
            assert!(suggested_state.code_sources[0]
                .staff_guidance
                .contains("Local AI guidance draft"));
            let guidance = serde_json::json!({
                "guidanceDraft": "Staff should confirm event permits before interpreting quiet hours.",
                "summaryDraft": "Quiet hours generally begin at 10 PM, but special event permits may change enforcement."
            });
            city_work_action("draft-code-guidance", Some(&guidance)).expect("guidance drafted");
            city_work_action("approve-code-guidance", None).expect("guidance approved");
            city_work_action("publish-code-source", None).expect("source published");
            city_work_action("create-code-handoff", None).expect("handoff created");
            let state = city_work_state().expect("state reads");
            let source = state.code_sources.first().expect("source exists");
            assert_eq!(source.public_status, "published");
            assert_eq!(source.codifier_name, "Municode");
            assert_eq!(
                source.codifier_sync_status,
                "stale - codifier update pending"
            );
            assert_eq!(source.codifier_sync_errors.len(), 0);
            assert_eq!(source.amendment_notes.len(), 1);
            assert!(source.last_codifier_sync_at_unix_seconds.is_some());
            assert!(source.stale_since_unix_seconds.is_some());
            assert_eq!(source.version_history.len(), 3);
            assert_eq!(source.version_history[0].status, "local import");
            assert_eq!(source.version_history[1].label, "2026-07 codifier export");
            assert_eq!(source.version_history[2].status, "stale pending update");
            assert!(source.guidance_approved_at_unix_seconds.is_some());
            assert_eq!(source.public_exports.len(), 1);
            assert!(source.published_at_unix_seconds.is_some());
            assert!(PathBuf::from(&source.public_exports[0]).is_file());
            let public_export =
                fs::read_to_string(&source.public_exports[0]).expect("public code export reads");
            assert_export_integrity_manifest(&source.public_exports[0], &public_export);
            assert!(public_export.contains("Non-Authoritative Plain-English Summary"));
            assert!(public_export.contains("Version / Codifier History"));
            assert!(public_export.contains("2026-07 codifier export"));
            assert!(public_export.contains("stale pending update"));
            assert!(public_export.contains("contact city staff"));
            assert!(!public_export.contains("Staff should confirm event permits"));
            assert!(!public_export.contains("Ordinance 2026-14"));
            let publication = state
                .publication_events
                .iter()
                .find(|event| event.record_type == "code-source")
                .expect("code source publication event exists");
            assert_eq!(publication.source_module, "civiccode");
            assert_eq!(publication.source_record_id, source.id);
            assert_eq!(publication.payload_hash.len(), 64);
            assert!(publication.retracted_at_unix_seconds.is_none());
            assert_eq!(state.code_handoffs.len(), 1);
            let results = search_city_work(&state, "event permits");
            assert_eq!(results.len(), 1);
            assert_eq!(results[0].citation, "CMC 8.12");
            let version_results = search_city_work(&state, "2026-07 codifier export");
            assert_eq!(version_results.len(), 1);
            assert_eq!(version_results[0].citation, "CMC 8.12");
        });
    }

    #[test]
    fn code_publication_can_be_retracted() {
        with_temp_state_dir(|_| {
            let payload = serde_json::json!({
                "title": "Noise Ordinance",
                "citation": "CMC 8.12",
                "body": "Quiet hours begin at 10 PM."
            });
            city_work_action("import-code-source", Some(&payload)).expect("source imported");
            city_work_action("publish-code-source", None).expect("source published");
            city_work_action("unpublish-code-source", None).expect("source unpublished");

            let state = city_work_state().expect("state reads");
            let source = state.code_sources.first().expect("source exists");
            assert_eq!(source.public_status, "internal draft");
            assert!(source.published_at_unix_seconds.is_none());
            assert_eq!(source.public_exports.len(), 1);
            let publication = state
                .publication_events
                .iter()
                .find(|event| event.record_type == "code-source")
                .expect("code source publication event exists");
            assert_eq!(publication.source_module, "civiccode");
            assert_eq!(publication.source_record_id, source.id);
            assert_eq!(publication.payload_hash.len(), 64);
            assert!(publication.retracted_at_unix_seconds.is_some());
            assert_eq!(publication.retracted_by, "civiccode");
            assert!(state
                .audit_entries
                .iter()
                .any(|entry| entry.action == "unpublish-code-source"));
            assert_valid_audit_chain(&state.audit_entries);
        });
    }

    #[test]
    fn code_question_answers_use_published_current_citations() {
        with_temp_state_dir(|_| {
            let payload = serde_json::json!({
                "title": "Backyard Chicken Rules",
                "citation": "CMC 6.16.040",
                "body": "Backyard chickens are allowed with a coop permit and no roosters."
            });
            city_work_action("import-code-source", Some(&payload)).expect("source imported");
            let draft = serde_json::json!({
                "guidanceDraft": "Staff should verify parcel-specific nuisance complaints before answering.",
                "summaryDraft": "Backyard chickens are generally allowed with a coop permit, but roosters are not allowed."
            });
            city_work_action("draft-code-guidance", Some(&draft)).expect("guidance drafted");
            city_work_action("approve-code-guidance", None).expect("guidance approved");
            city_work_action("publish-code-source", None).expect("source published");

            let question = serde_json::json!({
                "query": "Can I have chickens?",
                "publicOnly": true
            });
            let result = city_work_action("answer-code-question", Some(&question))
                .expect("question answered");
            assert_eq!(result.search_results.len(), 1);
            assert_eq!(result.search_results[0].citation, "CMC 6.16.040");
            assert!(result.search_results[0]
                .snippet
                .contains("Non-authoritative public summary"));
            assert!(result.search_results[0]
                .snippet
                .contains("not legal advice"));
            assert!(result
                .state
                .audit_entries
                .iter()
                .any(|entry| entry.action == "answer-code-question"));

            let public_internal_question = serde_json::json!({
                "query": "parcel-specific nuisance complaints",
                "publicOnly": true
            });
            let public_internal_result =
                city_work_action("answer-code-question", Some(&public_internal_question))
                    .expect("public internal question handled");
            assert!(public_internal_result.search_results.is_empty());

            let staff_internal_question = serde_json::json!({
                "query": "parcel-specific nuisance complaints",
                "publicOnly": false
            });
            let staff_internal_result =
                city_work_action("answer-code-question", Some(&staff_internal_question))
                    .expect("staff internal question answered");
            assert_eq!(staff_internal_result.search_results.len(), 1);

            let stale = serde_json::json!({
                "amendmentNote": "Ordinance 2026-22 amended backyard animal rules."
            });
            city_work_action("mark-code-stale", Some(&stale)).expect("stale marked");
            let stale_result = city_work_action("answer-code-question", Some(&question))
                .expect("stale answer returns no cited result");
            assert!(stale_result.search_results.is_empty());
            assert!(stale_result
                .message
                .contains("No current cited code source matched"));
        });
    }

    #[test]
    fn workflow_actions_target_selected_records_when_ids_are_supplied() {
        with_temp_state_dir(|_| {
            let budget_meeting = serde_json::json!({
                "title": "Budget Meeting",
                "meetingDate": "2026-07-01",
                "summary": "Budget agenda",
                "agendaTitle": "Open budget hearing"
            });
            let planning_meeting = serde_json::json!({
                "title": "Planning Meeting",
                "meetingDate": "2026-07-02",
                "summary": "Planning agenda",
                "agendaTitle": "Open planning hearing"
            });
            city_work_action("create-meeting", Some(&budget_meeting))
                .expect("budget meeting created");
            city_work_action("create-meeting", Some(&planning_meeting))
                .expect("planning meeting created");
            let state = city_work_state().expect("state reads");
            let budget_meeting_id = state
                .meetings
                .iter()
                .find(|meeting| meeting.title == "Budget Meeting")
                .expect("budget meeting exists")
                .id
                .clone();
            let planning_meeting_id = state
                .meetings
                .iter()
                .find(|meeting| meeting.title == "Planning Meeting")
                .expect("planning meeting exists")
                .id
                .clone();
            let selected_agenda = serde_json::json!({
                "meetingId": budget_meeting_id,
                "agendaTitle": "Adopt selected budget item"
            });
            city_work_action("add-agenda-item", Some(&selected_agenda))
                .expect("selected meeting receives agenda item");
            let state = city_work_state().expect("state reads");
            let budget_meeting = state
                .meetings
                .iter()
                .find(|meeting| meeting.title == "Budget Meeting")
                .expect("budget meeting exists");
            let planning_meeting = state
                .meetings
                .iter()
                .find(|meeting| meeting.title == "Planning Meeting")
                .expect("planning meeting exists");
            assert_eq!(budget_meeting.agenda_items.len(), 2);
            assert_eq!(planning_meeting.agenda_items.len(), 1);
            assert!(budget_meeting
                .agenda_items
                .iter()
                .any(|item| item.title == "Adopt selected budget item"));
            assert_eq!(planning_meeting.id, planning_meeting_id);

            let alex_request = serde_json::json!({
                "requester": "Alex Rivera",
                "summary": "Park contract emails",
                "deadline": "2026-07-10"
            });
            let blake_request = serde_json::json!({
                "requester": "Blake Chen",
                "summary": "Permit files",
                "deadline": "2026-07-11"
            });
            city_work_action("create-records-request", Some(&alex_request))
                .expect("alex request created");
            city_work_action("create-records-request", Some(&blake_request))
                .expect("blake request created");
            let state = city_work_state().expect("state reads");
            let alex_request_id = state
                .records_requests
                .iter()
                .find(|request| request.requester == "Alex Rivera")
                .expect("alex request exists")
                .id
                .clone();
            let assign_alex = serde_json::json!({
                "recordsRequestId": alex_request_id,
                "assignedTo": "Records Officer A"
            });
            city_work_action("assign-records-request", Some(&assign_alex))
                .expect("selected request assigned");
            let state = city_work_state().expect("state reads");
            let alex = state
                .records_requests
                .iter()
                .find(|request| request.requester == "Alex Rivera")
                .expect("alex request exists");
            let blake = state
                .records_requests
                .iter()
                .find(|request| request.requester == "Blake Chen")
                .expect("blake request exists");
            assert_eq!(alex.assigned_to, "Records Officer A");
            assert!(blake.assigned_to.is_empty());

            let noise_source = serde_json::json!({
                "title": "Noise Ordinance",
                "citation": "CMC 8.12",
                "body": "Quiet hours begin at 10 PM."
            });
            let signs_source = serde_json::json!({
                "title": "Sign Code",
                "citation": "CMC 17.48",
                "body": "Temporary signs require review."
            });
            city_work_action("import-code-source", Some(&noise_source))
                .expect("noise source imported");
            city_work_action("import-code-source", Some(&signs_source))
                .expect("sign source imported");
            let state = city_work_state().expect("state reads");
            let noise_source_id = state
                .code_sources
                .iter()
                .find(|source| source.title == "Noise Ordinance")
                .expect("noise source exists")
                .id
                .clone();
            let noise_guidance = serde_json::json!({
                "codeSourceId": noise_source_id.clone(),
                "guidanceDraft": "Confirm special event permits before enforcement.",
                "summaryDraft": "Quiet hours may vary for permitted events."
            });
            city_work_action("draft-code-guidance", Some(&noise_guidance))
                .expect("selected source receives guidance");
            let handoff_payload = serde_json::json!({
                "codeSourceId": noise_source_id,
                "summary": "Bring selected noise ordinance to council."
            });
            city_work_action("create-code-handoff", Some(&handoff_payload))
                .expect("handoff created from selected source");
            let state = city_work_state().expect("state reads");
            let noise = state
                .code_sources
                .iter()
                .find(|source| source.title == "Noise Ordinance")
                .expect("noise source exists");
            let signs = state
                .code_sources
                .iter()
                .find(|source| source.title == "Sign Code")
                .expect("sign source exists");
            assert_eq!(
                noise.staff_guidance,
                "Confirm special event permits before enforcement."
            );
            assert!(signs.staff_guidance.is_empty());
            let handoff = state.code_handoffs.first().expect("handoff exists");
            assert_eq!(handoff.source_id, noise.id);
            let handoff_id = handoff.id.clone();

            let selected_handoff = serde_json::json!({
                "meetingId": budget_meeting.id.clone(),
                "codeHandoffId": handoff_id
            });
            city_work_action("add-code-handoff-agenda", Some(&selected_handoff))
                .expect("selected handoff added to selected meeting");
            let state = city_work_state().expect("state reads");
            let budget_meeting = state
                .meetings
                .iter()
                .find(|meeting| meeting.title == "Budget Meeting")
                .expect("budget meeting exists");
            let planning_meeting = state
                .meetings
                .iter()
                .find(|meeting| meeting.title == "Planning Meeting")
                .expect("planning meeting exists");
            assert!(budget_meeting
                .agenda_items
                .iter()
                .any(|item| item.title.contains("Noise Ordinance")));
            assert!(!planning_meeting
                .agenda_items
                .iter()
                .any(|item| item.title.contains("Noise Ordinance")));
            assert_eq!(
                state.code_handoffs[0].status,
                "sent to clerk agenda".to_string()
            );
            assert_valid_audit_chain(&state.audit_entries);
        });
    }

    #[test]
    fn code_handoff_can_be_added_to_clerk_agenda() {
        with_temp_state_dir(|_| {
            let meeting = serde_json::json!({
                "title": "Council Regular Meeting",
                "meetingDate": "2026-07-01",
                "summary": "Ordinance review"
            });
            city_work_action("create-meeting", Some(&meeting)).expect("meeting created");
            let source = serde_json::json!({
                "title": "Noise Ordinance",
                "citation": "CMC 8.12",
                "body": "Quiet hours begin at 10 PM."
            });
            city_work_action("import-code-source", Some(&source)).expect("source imported");
            city_work_action("create-code-handoff", None).expect("handoff created");
            city_work_action("add-code-handoff-agenda", None).expect("handoff added");

            let state = city_work_state().expect("state reads");
            let meeting = state.meetings.first().expect("meeting exists");
            assert_eq!(meeting.agenda_items.len(), 1);
            assert_eq!(meeting.agenda_items[0].visibility, "staff draft");
            assert!(meeting.agenda_items[0]
                .title
                .contains("Code review: Clerk handoff: Noise Ordinance"));
            assert_eq!(
                state.code_handoffs[0].status,
                "sent to clerk agenda".to_string()
            );
            assert!(state
                .audit_entries
                .iter()
                .any(|entry| entry.action == "add-code-handoff-agenda"));
            assert_valid_audit_chain(&state.audit_entries);
        });
    }
}
