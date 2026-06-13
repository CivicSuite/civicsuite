use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};
use std::env;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

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
    pub commenter_contact: String,
    pub mode: String,
    pub topic: String,
    pub body: String,
    pub status: String,
    pub submitted_at_unix_seconds: u64,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Meeting {
    pub id: String,
    pub title: String,
    pub meeting_date: String,
    pub status: String,
    pub notice_status: String,
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
    pub approved_at_unix_seconds: Option<u64>,
    #[serde(default)]
    pub fulfilled_at_unix_seconds: Option<u64>,
    #[serde(default)]
    pub closed_at_unix_seconds: Option<u64>,
    pub created_at_unix_seconds: u64,
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

fn civic_suite_root() -> PathBuf {
    env::var("CIVICSUITE_DESKTOP_STATE_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            env::var("LOCALAPPDATA")
                .map(PathBuf::from)
                .unwrap_or_else(|_| PathBuf::from("{local_app_data}"))
                .join("CivicSuite")
        })
}

fn workflows_path() -> PathBuf {
    civic_suite_root()
        .join("Data")
        .join("workflows")
        .join("city-work.json")
}

fn exports_dir() -> PathBuf {
    civic_suite_root().join("Data").join("exports")
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

fn post_notice(state: &mut CityWorkState, payload: Option<&Value>) -> Result<String, String> {
    let meeting = selected_meeting_mut(state, payload)?;
    ensure_meeting_can_change(meeting)?;
    if meeting.agenda_items.is_empty() {
        return Err("Add at least one agenda item before posting notice.".to_string());
    }
    let title = meeting.title.clone();
    meeting.notice_status = "public notice ready".to_string();
    meeting.status = "notice ready".to_string();
    push_audit(
        state,
        "civicclerk",
        "post-notice",
        format!("Prepared public notice for: {title}"),
    );
    Ok("Notice marked ready with agenda evidence preserved locally.".to_string())
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
    if meeting.notice_status != "public notice ready" && meeting.status != "packet exported" {
        return Err(
            "Public comments open only after the meeting notice or packet is posted.".to_string(),
        );
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
                format!(
                    "- {} [{} / {}]: {}",
                    comment.commenter_name, comment.mode, comment.status, comment.body
                )
            })
            .collect::<Vec<_>>()
            .join("\n")
    };
    let minutes_adoption = meeting
        .minutes_adopted_at_unix_seconds
        .map(|timestamp| format!("Adopted at Unix timestamp {timestamp}."))
        .unwrap_or_else(|| "Minutes have not been adopted.".to_string());
    format!(
        "# {}\n\nDate: {}\nStatus: {}\nNotice: {}\n\n## Summary\n{}\n\n## Agenda\n{}\n\n## Minutes\n{}\n\n## Minutes Adoption\n{}\n\n## Outcomes\n{}\n\n## Action Items\n{}\n\n## Staff-Entered Resident Comments\n{}\n\n## Public Comments\n{}\n",
        meeting.title,
        meeting.meeting_date,
        meeting.status,
        meeting.notice_status,
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
            deadline,
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
            approved_at_unix_seconds: None,
            fulfilled_at_unix_seconds: None,
            closed_at_unix_seconds: None,
            created_at_unix_seconds: now_unix_seconds(),
        },
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
            requester_contact,
            submitted_via: "Resident/Public local intake".to_string(),
            summary,
            deadline,
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
            approved_at_unix_seconds: None,
            fulfilled_at_unix_seconds: None,
            closed_at_unix_seconds: None,
            created_at_unix_seconds: now_unix_seconds(),
        },
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

fn request_records_clarification(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let note = payload_string(payload, "clarificationNote")?;
    let request = selected_record_mut(state, payload)?;
    ensure_records_request_active(request)?;
    request.clarification_notes.push(note.clone());
    request.status = "clarification".to_string();
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
    push_audit(
        state,
        "civicrecords-ai",
        "draft-records-response",
        "Drafted records response with local citation evidence.".to_string(),
    );
    Ok("Records response draft saved with citation evidence.".to_string())
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
    let contents = format!(
        "# Records Response\n\nTracking number: {}\nRequester: {}\nContact: {}\nSubmitted via: {}\nDeadline: {}\nAssigned to: {}\nStatus: {}\nFee estimate: {}\n\n## Request\n{}\n\n## Clarification Notes\n{}\n\n## Search Notes\n{}\n\n## Exemption Review\n{}\n\n## Approved Response\n{}\n\n## Citations\n{}\n\n## Approval Notes\n{}\n",
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
    push_audit(
        state,
        "civicrecords-ai",
        "export-records-response",
        format!("Exported records response package: {export_path}"),
    );
    Ok(format!("Records response export written to {export_path}."))
}

fn fulfill_records_request(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let (request_id, public_payload) = {
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
        (
            request.id.clone(),
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
        request_id,
        "records-response",
        public_payload,
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
    let request = selected_record_mut(state, payload)?;
    if request.closed_at_unix_seconds.is_some() || request.status == "closed" {
        return Err("This records request is already closed.".to_string());
    }
    if request.fulfilled_at_unix_seconds.is_none() {
        return Err("Fulfill the records request before closing it.".to_string());
    }
    request.closed_at_unix_seconds = Some(now_unix_seconds());
    request.status = "closed".to_string();
    push_audit(
        state,
        "civicrecords-ai",
        "close-records-request",
        "Closed fulfilled records request.".to_string(),
    );
    Ok("Records request closed with audit evidence preserved.".to_string())
}

fn import_code_source(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let title = payload_string(payload, "title")?;
    let citation = payload_string(payload, "citation")?;
    let body = payload_string(payload, "body")?;
    let id = new_id("code", state.code_sources.len());
    state.code_sources.insert(
        0,
        CodeSource {
            id,
            title: title.clone(),
            citation,
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
            staff_guidance: String::new(),
            plain_language_summary: String::new(),
            guidance_approved_at_unix_seconds: None,
            public_status: default_code_public_status(),
            public_exports: Vec::new(),
            published_at_unix_seconds: None,
            created_at_unix_seconds: now_unix_seconds(),
        },
    );
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
    source.authoritative_url = authoritative_url;
    source.version_label = version_label;
    source.codifier_sync_status = "synced".to_string();
    source.codifier_sync_errors.clear();
    source.last_codifier_sync_at_unix_seconds = Some(now_unix_seconds());
    source.stale_since_unix_seconds = None;
    source.status = "codifier synced".to_string();
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
        let staff_guidance = if source.staff_guidance.trim().is_empty() {
            "No internal staff guidance recorded.".to_string()
        } else {
            source.staff_guidance.clone()
        };
        let amendments =
            list_or_default(&source.amendment_notes, "No pending amendments recorded.");
        let sync_errors = list_or_default(
            &source.codifier_sync_errors,
            "No codifier sync errors recorded.",
        );
        let contents = format!(
            "# Municipal Code Source\n\nTitle: {}\nCitation: {}\nStatus: {}\nPublic status: published\nCodifier sync: {}\nAuthoritative URL: {}\n\n## Authoritative Text\n{}\n\n## Non-Authoritative Plain-English Summary\n{}\n\n## Internal Staff Guidance\n{}\n\n## Amendment / Stale Notes\n{}\n\n## Sync Errors\n{}\n\nFor legal interpretation, contact city staff and rely on the authoritative codified ordinance text.\n",
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
            staff_guidance,
            amendments,
            sync_errors
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
        if contains_query(
            &[
                &request.requester,
                &request.summary,
                &request.status,
                &request.assigned_to,
                &request.fee_estimate,
                &request.response_draft,
                &citations,
                &clarification_notes,
                &search_notes,
                &exemption_reviews,
                &approval_notes,
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
    results
}

pub fn city_work_state() -> Result<CityWorkState, String> {
    read_state()
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
        "post-notice" => post_notice(&mut state, payload)?,
        "record-minutes" => record_minutes(&mut state, payload)?,
        "record-vote" => record_vote(&mut state, payload)?,
        "add-action-item" => add_action_item(&mut state, payload)?,
        "record-resident-comment" => record_resident_comment(&mut state, payload)?,
        "submit-public-comment" => submit_public_comment(&mut state, payload)?,
        "adopt-minutes" => adopt_minutes(&mut state, payload)?,
        "export-meeting-packet" => export_meeting_packet(&mut state, payload)?,
        "archive-meeting" => archive_meeting(&mut state, payload)?,
        "create-records-request" => create_records_request(&mut state, payload)?,
        "submit-public-records-request" => submit_public_records_request(&mut state, payload)?,
        "request-records-clarification" => request_records_clarification(&mut state, payload)?,
        "assign-records-request" => assign_records_request(&mut state, payload)?,
        "record-records-search" => record_records_search(&mut state, payload)?,
        "add-records-exemption-review" => add_records_exemption_review(&mut state, payload)?,
        "estimate-records-fee" => estimate_records_fee(&mut state, payload)?,
        "draft-records-response" => draft_records_response(&mut state, payload)?,
        "approve-records-response" => approve_records_response(&mut state, payload)?,
        "export-records-response" => export_records_response(&mut state, payload)?,
        "fulfill-records-request" => fulfill_records_request(&mut state, payload)?,
        "close-records-request" => close_records_request(&mut state, payload)?,
        "import-code-source" => import_code_source(&mut state, payload)?,
        "record-codifier-sync" => record_codifier_sync(&mut state, payload)?,
        "record-codifier-sync-failure" => record_codifier_sync_failure(&mut state, payload)?,
        "retry-codifier-sync" => retry_codifier_sync(&mut state, payload)?,
        "mark-code-stale" => mark_code_stale(&mut state, payload)?,
        "draft-code-guidance" => draft_code_guidance(&mut state, payload)?,
        "approve-code-guidance" => approve_code_guidance(&mut state, payload)?,
        "publish-code-source" => publish_code_source(&mut state, payload)?,
        "unpublish-code-source" => unpublish_code_source(&mut state, payload)?,
        "create-code-handoff" => create_code_handoff(&mut state, payload)?,
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
            city_work_action("post-notice", None).expect("notice prepared");
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
            city_work_action("adopt-minutes", None).expect("minutes adopted");
            city_work_action("export-meeting-packet", None).expect("packet exported");
            city_work_action("archive-meeting", None).expect("meeting archived");
            let state = city_work_state().expect("state reads");
            let meeting = state.meetings.first().expect("meeting exists");
            assert_eq!(meeting.notice_status, "public notice ready");
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
            let archive = fs::read_to_string(&meeting.exports[1]).expect("archive reads");
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
            assert!(state.audit_entries.len() >= 9);
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
                "post-notice",
                Some(&serde_json::json!({ "meetingId": meeting_id })),
            )
            .expect("notice posted");
            city_work_action("submit-public-comment", Some(&public_comment))
                .expect("public comment saved");
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
            assert_eq!(comment.status, "received for clerk review");
            let exported = fs::read_to_string(meeting.exports.first().expect("export exists"))
                .expect("export reads");
            assert!(exported.contains("## Public Comments"));
            assert!(exported.contains("Please preserve the mature trees"));
            let results = search_city_work(&state, "mature trees");
            assert_eq!(results.len(), 1);
            assert!(state.audit_entries.iter().any(|entry| {
                entry.module_id == "civicclerk" && entry.action == "submit-public-comment"
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
            assert_eq!(request.assigned_to, "Records Officer");
            assert_eq!(request.clarification_notes.len(), 1);
            assert_eq!(request.search_notes.len(), 1);
            assert_eq!(request.exemption_reviews.len(), 1);
            assert_eq!(request.fee_estimate, "$12.50 staff time estimate");
            assert!(request.approved_at_unix_seconds.is_some());
            assert!(request.fulfilled_at_unix_seconds.is_some());
            assert!(request.closed_at_unix_seconds.is_some());
            assert_eq!(request.exports.len(), 1);
            assert!(PathBuf::from(&request.exports[0]).is_file());
            let exported = fs::read_to_string(&request.exports[0]).expect("export reads");
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
            let results = search_city_work(&state, "attorney-client");
            assert_eq!(results.len(), 1);
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
            assert!(request.approved_at_unix_seconds.is_none());
            assert!(request.fulfilled_at_unix_seconds.is_none());
            assert!(state.audit_entries.iter().any(|entry| {
                entry.module_id == "civicrecords-ai"
                    && entry.action == "submit-public-records-request"
                    && entry.summary.contains("REQ-0001")
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
            assert!(source.guidance_approved_at_unix_seconds.is_some());
            assert_eq!(source.public_exports.len(), 1);
            assert!(source.published_at_unix_seconds.is_some());
            assert!(PathBuf::from(&source.public_exports[0]).is_file());
            let public_export =
                fs::read_to_string(&source.public_exports[0]).expect("public code export reads");
            assert!(public_export.contains("Non-Authoritative Plain-English Summary"));
            assert!(public_export.contains("contact city staff"));
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
