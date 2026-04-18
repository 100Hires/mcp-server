# 100Hires MCP Server

Official [Model Context Protocol](https://modelcontextprotocol.io/) server for [100Hires](https://100hires.com) — the applicant tracking system for recruiting teams.

Exposes the full [100Hires API v2](https://100hires.com/api) as **130 MCP tools**, enabling AI assistants to manage candidates, jobs, applications, interviews, messages, and more.

## Prerequisites

Get your API key at [Settings > Integrations > API](https://app.100hires.com/settings/integrations#api_key_integration).

## Setup

### Claude Code

Run in your terminal:

```bash
claude mcp add 100hires \
  -e API_KEY=your-api-key \
  -- npx -y @100hires/mcp-server
```

### Claude Code (manual)

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "100hires": {
      "command": "npx",
      "args": ["-y", "@100hires/mcp-server"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

### Cursor

Open **Settings > MCP** and add:

```json
{
  "mcpServers": {
    "100hires": {
      "command": "npx",
      "args": ["-y", "@100hires/mcp-server"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

### Windsurf

Open **Settings > MCP** and add:

```json
{
  "mcpServers": {
    "100hires": {
      "command": "npx",
      "args": ["-y", "@100hires/mcp-server"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

### VS Code (Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "100hires": {
      "command": "npx",
      "args": ["-y", "@100hires/mcp-server"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

## Tools (130)

### Candidates (18 tools)

| Tool | Description |
|------|-------------|
| `hires_list_candidates` | List candidates with filters (job, stage, email, search, linkedin, timestamps) |
| `hires_create_candidate` | Create a new candidate with profile data |
| `hires_get_candidate` | Get candidate by ID or alias |
| `hires_update_candidate` | Update candidate fields |
| `hires_delete_candidate` | Delete a candidate |
| `hires_list_candidate_tags` | List candidate's tags |
| `hires_add_candidate_tags` | Attach tags to a candidate |
| `hires_remove_candidate_tag` | Remove a specific tag |
| `hires_batch_add_tags` | Bulk add tags to multiple candidates |
| `hires_batch_remove_tags` | Bulk remove tags from multiple candidates |
| `hires_list_candidate_files` | List candidate attachments |
| `hires_upload_candidate_file` | Upload a file (base64) |
| `hires_get_candidate_resume` | Get resume with optional text content |
| `hires_list_candidate_activities` | Get candidate timeline |
| `hires_disqualify_candidate` | Reject all active applications |
| `hires_list_candidate_interviews` | List candidate's interviews |
| `hires_list_candidate_messages` | List email history |
| `hires_send_candidate_message` | Schedule an email |

### Applications (18 tools)

| Tool | Description |
|------|-------------|
| `hires_list_applications` | List applications with filters (candidate, job, stage, status, AI score) |
| `hires_create_application` | Link candidate to job |
| `hires_get_application` | Get application details |
| `hires_update_application` | Update application fields |
| `hires_delete_application` | Delete an application |
| `hires_move_application` | Move to a specific pipeline stage |
| `hires_advance_application` | Advance to the next stage |
| `hires_hire_application` | Mark as hired |
| `hires_reject_application` | Reject with optional reason |
| `hires_unreject_application` | Undo rejection |
| `hires_transfer_application` | Transfer to another job |
| `hires_get_ai_score` | Get AI scoring breakdown |
| `hires_list_application_attachments` | List attachments |
| `hires_upload_application_attachment` | Upload attachment |
| `hires_list_application_evaluations` | List filled evaluations |
| `hires_create_interview` | Schedule interview for application |
| `hires_batch_move_applications` | Bulk move to stage |
| `hires_batch_reject_applications` | Bulk reject |

### Jobs (17 tools)

| Tool | Description |
|------|-------------|
| `hires_list_jobs` | List jobs with filters |
| `hires_create_job` | Create a job |
| `hires_get_job` | Get job by ID or alias |
| `hires_update_job` | Update job fields |
| `hires_delete_job` | Delete a job |
| `hires_set_job_status` | Change status (publish/archive/close) |
| `hires_list_job_boards` | List available job boards |
| `hires_publish_to_job_board` | Publish to a board |
| `hires_remove_from_job_board` | Remove from a board |
| `hires_batch_job_boards` | Get batch job board status |
| `hires_batch_publish_to_boards` | Publish to multiple boards |
| `hires_batch_remove_from_boards` | Remove from multiple boards |
| `hires_list_hiring_team` | List hiring team members |
| `hires_add_hiring_team_member` | Add hiring team member |
| `hires_list_job_webhooks` | List job webhooks |
| `hires_create_job_webhook` | Register a job webhook |
| `hires_delete_job_webhook` | Delete a job webhook |

### Messages (6 tools)

| Tool | Description |
|------|-------------|
| `hires_list_messages` | List messages by mail account |
| `hires_get_message` | Get a scheduled message |
| `hires_update_message` | Full update of scheduled message |
| `hires_patch_message` | Partial update of scheduled message |
| `hires_delete_message` | Cancel a scheduled message |
| `hires_batch_create_messages` | Batch schedule up to 100 messages |

### Notification Messages (4 tools)

| Tool | Description |
|------|-------------|
| `hires_get_notification_message` | Get a notification email (e.g. rejection) by ID |
| `hires_update_notification_message` | Update subject, body, reschedule send time |
| `hires_delete_notification_message` | Cancel a scheduled notification |
| `hires_cancel_all_notification_messages` | Cancel all scheduled notifications for a candidate |

### Interviews (2 tools)

| Tool | Description |
|------|-------------|
| `hires_list_interviews` | List interviews with filters |
| `hires_get_interview` | Get interview details |

### Notes (5 tools)

| Tool | Description |
|------|-------------|
| `hires_list_notes` | List candidate notes |
| `hires_create_note` | Create a note |
| `hires_get_note` | Get note details |
| `hires_update_note` | Update a note |
| `hires_delete_note` | Delete a note |

### Evaluations (1 tool)

| Tool | Description |
|------|-------------|
| `hires_get_evaluation` | Get evaluation form with answers |

### Forms (6 tools)

| Tool | Description |
|------|-------------|
| `hires_list_forms` | List application forms |
| `hires_create_form` | Create an application form |
| `hires_get_form` | Get form definition |
| `hires_update_form` | Update a form |
| `hires_delete_form` | Delete a form |
| `hires_update_form_question` | Update question visibility on a form |

### Email Templates (5 tools)

| Tool | Description |
|------|-------------|
| `hires_list_email_templates` | List email templates |
| `hires_create_email_template` | Create a template |
| `hires_get_email_template` | Get template details |
| `hires_update_email_template` | Update a template |
| `hires_delete_email_template` | Delete a template |

### Nurture Campaigns (5 tools)

| Tool | Description |
|------|-------------|
| `hires_list_nurture_campaigns` | List campaigns |
| `hires_create_nurture_campaign` | Create multi-step campaign |
| `hires_get_nurture_campaign` | Get campaign details |
| `hires_update_nurture_campaign` | Update a campaign |
| `hires_delete_nurture_campaign` | Delete a campaign |

### Users (3 tools)

| Tool | Description |
|------|-------------|
| `hires_list_users` | List company users |
| `hires_get_user` | Get user details |
| `hires_list_user_mail_accounts` | List user's mail accounts |

### Companies (11 tools)

| Tool | Description |
|------|-------------|
| `hires_list_companies` | List accessible companies |
| `hires_create_company` | Create a company |
| `hires_get_company` | Get company details |
| `hires_update_company` | Update company |
| `hires_delete_company` | Delete a company |
| `hires_list_company_mail_accounts` | List company mail accounts |
| `hires_list_company_id_mail_accounts` | List mail accounts for specific company |
| `hires_restore_company` | Restore deleted company |
| `hires_list_webhooks` | List company webhooks |
| `hires_create_webhook` | Register a webhook |
| `hires_delete_webhook` | Delete a webhook |

### Taxonomy & Reference (23 tools)

| Tool | Description |
|------|-------------|
| `hires_list_sources` | Candidate sources (LinkedIn, Referral, etc.) |
| `hires_list_origins` | Candidate origins |
| `hires_list_rejection_reasons` | Rejection reason dictionary |
| `hires_list_statuses` | Job/application statuses |
| `hires_list_departments` | Company departments |
| `hires_list_categories` | Job categories |
| `hires_list_education_levels` | Education levels |
| `hires_list_experience_levels` | Experience levels |
| `hires_list_employment_types` | Employment types |
| `hires_list_boards` | Available job boards |
| `hires_list_tags` | All tags |
| `hires_list_workflows` | Hiring workflows |
| `hires_list_workflow_stages` | All pipeline stages |
| `hires_get_workflow_stages` | Stages for specific workflow |
| `hires_list_questions` | Reusable questions |
| `hires_create_question` | Create a question |
| `hires_get_question` | Get question details |
| `hires_update_question` | Update a question |
| `hires_delete_question` | Delete a question |
| `hires_list_question_types` | Available question types |
| `hires_list_template_placeholders` | Email template placeholders |
| `hires_prepare_template_placeholders` | Render placeholders |
| `hires_get_billing` | Check account pricing/features |

### Attachments (2 tools)

| Tool | Description |
|------|-------------|
| `hires_download_attachment` | Download an attachment by absolute URL (resume, candidate file, application file, mail attachment, call recording). Returns base64-encoded bytes + metadata. 25 MB limit. |
| `hires_upload_attachment` | Upload a file as `voicemail`/`candidate`/`application` attachment. Voicemail upload produces a uuid usable as `attachment_uuid` in nurture-campaign voicemail steps. |

### Feedback (1 tool)

| Tool | Description |
|------|-------------|
| `hires_submit_feedback` | Submit structured API feedback about issues or improvements |

### Career Site (3 tools, public)

| Tool | Description |
|------|-------------|
| `hires_list_career_jobs` | Public job openings |
| `hires_get_career_job` | Get public job details |
| `hires_submit_career_application` | Submit application via career site |

> Career site tools use `company_slug` instead of API key authentication.

## API Documentation

- [100Hires API Docs](https://100hires.com/api)
- [OpenAPI Spec](https://api.100hires.com/v2/openapi.json)

## License

MIT
