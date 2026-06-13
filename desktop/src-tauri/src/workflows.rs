use serde::{Deserialize, Serialize};
use serde_json::Value;
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
pub struct Meeting {
    pub id: String,
    pub title: String,
    pub meeting_date: String,
    pub status: String,
    pub notice_status: String,
    pub summary: String,
    pub agenda_items: Vec<AgendaItem>,
    pub minutes: String,
    pub votes: Vec<String>,
    pub action_items: Vec<String>,
    #[serde(default)]
    pub exports: Vec<String>,
    pub created_at_unix_seconds: u64,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct RecordsRequest {
    pub id: String,
    pub requester: String,
    pub summary: String,
    pub deadline: String,
    pub status: String,
    pub citations: Vec<String>,
    pub response_draft: String,
    pub exports: Vec<String>,
    pub created_at_unix_seconds: u64,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct CodeSource {
    pub id: String,
    pub title: String,
    pub citation: String,
    pub body: String,
    pub status: String,
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
    let file_name = format!("{}-{}.md", safe_file_stem(stem), now_unix_seconds());
    let path = directory.join(file_name);
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

fn push_audit(state: &mut CityWorkState, module_id: &str, action: &str, summary: String) {
    let id = new_id("audit", state.audit_entries.len());
    state.audit_entries.push(AuditEntry {
        id,
        module_id: module_id.to_string(),
        action: action.to_string(),
        summary,
        created_at_unix_seconds: now_unix_seconds(),
    });
}

fn first_meeting_mut(state: &mut CityWorkState) -> Result<&mut Meeting, String> {
    state
        .meetings
        .first_mut()
        .ok_or_else(|| "Create a meeting before recording this clerk action.".to_string())
}

fn first_record_mut(state: &mut CityWorkState) -> Result<&mut RecordsRequest, String> {
    state.records_requests.first_mut().ok_or_else(|| {
        "Create a records request before drafting or exporting a response.".to_string()
    })
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
        exports: Vec::new(),
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
    let agenda_count = {
        let meeting = first_meeting_mut(state)?;
        meeting.agenda_items.len()
    };
    let meeting = first_meeting_mut(state)?;
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

fn post_notice(state: &mut CityWorkState) -> Result<String, String> {
    let meeting = first_meeting_mut(state)?;
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
    let meeting = first_meeting_mut(state)?;
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
    let meeting = first_meeting_mut(state)?;
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

fn export_meeting_packet(state: &mut CityWorkState) -> Result<String, String> {
    let meeting = first_meeting_mut(state)?;
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
    let votes = if meeting.votes.is_empty() {
        "No outcomes recorded.".to_string()
    } else {
        meeting
            .votes
            .iter()
            .map(|vote| format!("- {vote}"))
            .collect::<Vec<_>>()
            .join("\n")
    };
    let contents = format!(
        "# {}\n\nDate: {}\nStatus: {}\nNotice: {}\n\n## Summary\n{}\n\n## Agenda\n{}\n\n## Minutes\n{}\n\n## Outcomes\n{}\n",
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
        votes
    );
    let export_path = write_export_file("meetings", &meeting.title, &contents)?;
    meeting.exports.push(export_path.clone());
    meeting.status = "packet exported".to_string();
    push_audit(
        state,
        "civicclerk",
        "export-meeting-packet",
        format!("Exported meeting packet: {export_path}"),
    );
    Ok(format!("Meeting packet export written to {export_path}."))
}

fn create_records_request(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let requester = payload_string(payload, "requester")?;
    let summary = payload_string(payload, "summary")?;
    let deadline = payload_string(payload, "deadline")?;
    let id = new_id("records", state.records_requests.len());
    state.records_requests.insert(
        0,
        RecordsRequest {
            id,
            requester: requester.clone(),
            summary,
            deadline,
            status: "intake".to_string(),
            citations: Vec::new(),
            response_draft: String::new(),
            exports: Vec::new(),
            created_at_unix_seconds: now_unix_seconds(),
        },
    );
    push_audit(
        state,
        "civicrecords-ai",
        "create-records-request",
        format!("Created records request for: {requester}"),
    );
    Ok("Records request intake saved locally with deadline tracking.".to_string())
}

fn draft_records_response(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let draft = payload_string(payload, "responseDraft")?;
    let citation = payload_optional_string(payload, "citation");
    let request = first_record_mut(state)?;
    request.response_draft = draft;
    request.status = "review draft".to_string();
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

fn export_records_response(state: &mut CityWorkState) -> Result<String, String> {
    let request = first_record_mut(state)?;
    if request.response_draft.trim().is_empty() {
        return Err("Draft a records response before exporting.".to_string());
    }
    let citations = if request.citations.is_empty() {
        "No citations recorded.".to_string()
    } else {
        request
            .citations
            .iter()
            .map(|citation| format!("- {citation}"))
            .collect::<Vec<_>>()
            .join("\n")
    };
    let contents = format!(
        "# Records Response\n\nRequester: {}\nDeadline: {}\nStatus: {}\n\n## Request\n{}\n\n## Draft Response\n{}\n\n## Citations\n{}\n",
        request.requester,
        request.deadline,
        request.status,
        request.summary,
        request.response_draft,
        citations
    );
    let export_path = write_export_file("records", &request.requester, &contents)?;
    request.exports.push(export_path.clone());
    request.status = "exported".to_string();
    push_audit(
        state,
        "civicrecords-ai",
        "export-records-response",
        format!("Exported records response package: {export_path}"),
    );
    Ok(format!("Records response export written to {export_path}."))
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

fn create_code_handoff(
    state: &mut CityWorkState,
    payload: Option<&Value>,
) -> Result<String, String> {
    let source = state
        .code_sources
        .first()
        .ok_or_else(|| "Import a code source before creating a clerk handoff.".to_string())?;
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
        if contains_query(&[&meeting.title, &meeting.summary, &meeting.status], query) {
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
        if contains_query(
            &[&request.requester, &request.summary, &request.status],
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
        if contains_query(&[&source.title, &source.citation, &source.body], query) {
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
        "post-notice" => post_notice(&mut state)?,
        "record-minutes" => record_minutes(&mut state, payload)?,
        "record-vote" => record_vote(&mut state, payload)?,
        "export-meeting-packet" => export_meeting_packet(&mut state)?,
        "create-records-request" => create_records_request(&mut state, payload)?,
        "draft-records-response" => draft_records_response(&mut state, payload)?,
        "export-records-response" => export_records_response(&mut state)?,
        "import-code-source" => import_code_source(&mut state, payload)?,
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

    #[test]
    fn meeting_workflow_persists_agenda_notice_minutes_and_vote() {
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
            city_work_action("export-meeting-packet", None).expect("packet exported");
            let state = city_work_state().expect("state reads");
            let meeting = state.meetings.first().expect("meeting exists");
            assert_eq!(meeting.notice_status, "public notice ready");
            assert_eq!(meeting.status, "packet exported");
            assert_eq!(meeting.votes.len(), 1);
            assert_eq!(meeting.exports.len(), 1);
            assert!(PathBuf::from(&meeting.exports[0]).is_file());
            assert!(state.audit_entries.len() >= 5);
        });
    }

    #[test]
    fn records_workflow_persists_draft_and_export() {
        with_temp_state_dir(|_| {
            let payload = serde_json::json!({
                "requester": "Alex Rivera",
                "summary": "Emails about park contract",
                "deadline": "2026-07-10"
            });
            city_work_action("create-records-request", Some(&payload)).expect("request created");
            let draft = serde_json::json!({
                "responseDraft": "Responsive records are attached for review.",
                "citation": "PRA-2026-001"
            });
            city_work_action("draft-records-response", Some(&draft)).expect("draft saved");
            city_work_action("export-records-response", None).expect("export saved");
            let state = city_work_state().expect("state reads");
            let request = state.records_requests.first().expect("request exists");
            assert_eq!(request.status, "exported");
            assert_eq!(request.exports.len(), 1);
            assert!(PathBuf::from(&request.exports[0]).is_file());
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
            city_work_action("create-code-handoff", None).expect("handoff created");
            let state = city_work_state().expect("state reads");
            assert_eq!(state.code_handoffs.len(), 1);
            let results = search_city_work(&state, "quiet hours");
            assert_eq!(results.len(), 1);
            assert_eq!(results[0].citation, "CMC 8.12");
        });
    }
}
