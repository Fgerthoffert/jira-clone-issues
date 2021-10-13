# jira-clone-issues

Forked from [zindexer](https://github.com/zencrepes/zindexer), this projects aims at cloning issues from one project on a Jira instance to another project in another Jira instance.

The main purpose is to be able to import issues from a project in a remote Jira instance to be able to see those in an Agile board amongst other issues worked on by a team.

## Overview

Synchronizing resources between Jira instances can be very challenging, mostly due to limitations of Jira REST API. To work around those limitations, the script was implemented to be articulated around a limited number of fields that are being re-imported whenever an issue is updated on the source Jira instance.

Currently, the following four fields are imported:
* status (open, in-progress, closed...)
* type (Story, Defect, ...)
* summary (title)
* description: this field gets updated to include a header containing details about the source (such as link, reporter, assignee) as well as comments in the source instance.

All of the other fields are free to be used on the destination Jira instance and will not be overwritten during synchronization. This allow the team to add labels, sprints, different assignees, and more... on the destination instance without impacting the source Jira instance.

The system was designed on the assumption that the user has limited access to the source Jira instance, and greater level of permissions on the destination Jira instance.

## Configuration

You will need to create a project on your destination instance, which must be pre-configured with the necessary statuses, issue types and workflow. The workflow must either be configured to allow any transition or to match the workflow in the source project.

To help you in preparing the configuration, a `prepare` command has been created. It will fetch all issues from the source, grab the list of statuses/types and compare it with the ones available in the destination server.

```bash
#> jira-clone-issues perpare
```

The destination project must also be configured with the screen containing the fields to be modified (summary, description, type).

### Mappings

The configuration file contains three sections dealing with mapping elements from one project to the next. Each of them contains a `source` and `destination` corresponding to the source and destination jira projects.

| config | Description |
|---|---|
| issueTypes | Map issue types between resources, for example if `Bug` on the source project must translate into `Defect` on the destination project |
| status  | Map status between resources, for example if `OPEN` on the source project must translate into `TO-DO` on the destination project |

### Custom fields

Go to Jira > Administartion > Issues > Custom field, and create a custom field that will be used to store the date at which an issue in the source Jira instance was last updated At. This is useful to quickly compare the issue's data between the source and destination.

Jira is going to automatically assign this field an ID in the format `customfield_11610`. Edit this custom field and look at the page URL (for example: https://jira.domain.org/secure/admin/ConfigureCustomField!default.jspa?customFieldId=11610). In that particular case the field becomes: `customfield_11610`.

Update your configuration file with this for the config parameter `syncSourceUpdatedAt`.

## Limitations

* Do NOT delete issues from the destination, if you do so you might end-up with ticket keys being out of sync
* All fields to be modified MUST be on a screen

## Use

To determine what needs to be updated, the script will first connect to the destination instance to grab the most recently udpated issue (using the `syncSourceUpdatedAt` field created above). It will then begin grabbing issues from the source in batch of X issues (`X` being the `maxNodes` in the configuration) until it reaches an issue with its `updated` date older than the most recent issue on the destination server.

To make best use of this synchronization, it is recommended to do the first synchronization manually (as it will likely fetch a large number of issues), then use a cron job to fetch the updated issues every couple of minutes.

You can update tickets using the following command: 

```bash
#> jira-clone-issues update
```

.