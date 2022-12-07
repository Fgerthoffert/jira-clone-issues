
import { JiraMap } from '../../../../global';

import getIssueTransitions from '../getIssueTransitions';
import updateIssue from '../updateIssue';
import { Config, JiraTransition } from '../../../../global';

const batchUpdateIssues = async (userConfig: Config, issuesToPush: any[], logger: any) => {
  const availableTransitions: any = [];
  for (const sourceIssue of issuesToPush) {
    const dstIssueKey = `${userConfig.destination.projectKey}-${sourceIssue.key.replace(`${userConfig.source.projectKey}-`, '')}`
    if (availableTransitions.length === 0) {
      // If there are no transitions in availableTransitions, we get it from the first issue
      const transitions = await getIssueTransitions(userConfig.destination, dstIssueKey)        
      for (const t of transitions) {
        if (!availableTransitions.find((at: JiraTransition) => at.name === t.name)) {
          availableTransitions.push({id: t.id, name: t.name})
        }          
      }
    }
    const fieldsObj: any = {};

    // Handle issue type field
    const issueTypeMap = userConfig.issueTypes.find((t: JiraMap) => t.source === sourceIssue.fields.issuetype.name)
    if (issueTypeMap !== undefined) {
      fieldsObj['issuetype'] = {name: issueTypeMap.destination}
    } else {
      fieldsObj['issuetype'] = {name: sourceIssue.fields.issuetype.name}
    }

    // Handle all default fields
    for (const field of userConfig.fields) {
      if (sourceIssue.fields[field.source] !== null) {
        fieldsObj[field.destination] = sourceIssue.fields[field.source]
      }
    }

    // Handle updatedAt
    if (userConfig.destination.fields !== undefined) {
      fieldsObj[userConfig.destination.fields.syncSourceUpdatedAt] = sourceIssue.fields.updated
    }

    // Generate description, which is being updated every time an update is detected
    let descriptionField = `Source Project: ${sourceIssue.fields.project.name} \n`
    descriptionField += `Last Updated: ${new Date(sourceIssue.fields.updated)} (Imported: ${new Date()}) \n`
    descriptionField += `Link: ${userConfig.source.host}/browse/${sourceIssue.key} \n`
    descriptionField += `Type: ${sourceIssue.fields.issuetype.name} \n`
    if (sourceIssue.fields.parent !== undefined && sourceIssue.fields.parent !== null) {
      descriptionField += `Parent: ${userConfig.source.host}/browse/${sourceIssue.fields.parent.key} (${sourceIssue.fields.parent.fields.summary}) \n`
    }
    descriptionField += `Reporter: ${sourceIssue.fields.reporter === null ? 'EMPTY' : sourceIssue.fields.reporter.displayName} \n`
    descriptionField += `Assignee: ${sourceIssue.fields.assignee === null ? 'EMPTY' : sourceIssue.fields.assignee.displayName} \n`
    descriptionField += `---- \n\n\n`
    descriptionField += `*+Source issue description:+*\n`
    if (sourceIssue.fields.description === null) {
      descriptionField += `=== NO DESCRIPTION IN SOURCE PROJECT === \n`
    } else {
      descriptionField += sourceIssue.fields.description.slice(0, 20000)
      if (sourceIssue.fields.description.length > 20000) {
        descriptionField += `=== DESCRIPTION EXCEED MAX LENGTH - See source ticket for full content === \n`
      }
    }

    // Add comments to the body of the issue
    if (sourceIssue.fields.comment.total > 0) {
      descriptionField += `\n ---- \n`
      descriptionField += `*+Source issue comments:+*\n`
      for (const comment of sourceIssue.fields.comment.comments) {
        descriptionField += `${comment.author.displayName} at ${new Date(comment.created)}\n`
        descriptionField += `${comment.body} \n`
        descriptionField += `------ \n\n\n`
      }
    }

    fieldsObj['description'] = descriptionField

    logger(`${dstIssueKey} - Submitting update to Destination: ${JSON.stringify(fieldsObj)}`);
    await updateIssue(userConfig.destination, {key: dstIssueKey, fields: fieldsObj})      
  }
};

export default batchUpdateIssues;
