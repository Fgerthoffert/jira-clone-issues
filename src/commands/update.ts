import { flags } from '@oclif/command';

import cli from 'cli-ux';

import Command from '../base';

import {
  JiraInstance,
  JiraInstanceDestination
} from '../global';


import { fetchJql } from '../utils/jira/utils/fetchJql';
import fetchJqlPagination from '../utils/jira/utils/fetchJql';
import createEmptyIssue from '../utils/jira/utils/createEmptyIssue';
import batchUpdateIssues from '../utils/jira/utils/batchUpdateIssues';
import batchUpdateStatus from '../utils/jira/utils/batchUpdateStatus';

const getLastissuesToUpdate = async (jiraInstance: JiraInstance & JiraInstanceDestination) => {
  let dateField = 'updated';
  if (jiraInstance.fields !== undefined && jiraInstance.fields.syncSourceUpdatedAt !== undefined) {
    dateField = `${jiraInstance.fields.syncSourceUpdatedAt.replace('customfield_', 'cf[')}]`
  } 
  const projectIssues = await fetchJql(
      jiraInstance,
      `project = "${jiraInstance.projectKey}" AND ${dateField} is not EMPTY ORDER BY ${dateField} DESC`,
      '*navigable,comment',
      0,
      1
    );
  if (projectIssues.maxResults === 1) {
    return projectIssues.issues[0]
  }
  return null;
}

const getLastIssueByKey = async (jiraInstance: JiraInstance) => {
  const projectIssues = await fetchJql(
      jiraInstance,
      `project = "${jiraInstance.projectKey}" ORDER BY key DESC`,
      '*navigable,comment',
      0,
      1
    );
  if (projectIssues.maxResults === 1) {
    return projectIssues.issues[0]
  }
  return null;
}

export default class Issues extends Command {
  static description = 'Update issues based on recent changes in the source';

  static flags = {
    help: flags.help({ char: 'h' }),
    envUserConf: flags.string({
      required: false,
      env: 'USER_CONFIG',
      description:
        'User Configuration passed as an environment variable, takes precedence over config file',
    }),
  };

  async run() {
    const userConfig = this.userConfig;

    cli.action.start(`Fetch the latest updated issue on source`);
    let lastIssue = await getLastissuesToUpdate(userConfig.destination)    
    cli.action.stop(`done`)

    // lastIssue could be null if the project is empty, in that case all issues will end-up being fetched from
    // the source instance
    if (lastIssue !== null) {
      this.log(`The last updated issue was: ${lastIssue.key}, updated on: ${lastIssue.fields[userConfig.destination.fields.syncSourceUpdatedAt]}`)
      // Modify lastIssue date
      lastIssue = {
        ...lastIssue,
        fields: {
          ...lastIssue.fields,
          updated: lastIssue.fields[userConfig.destination.fields.syncSourceUpdatedAt]
        }
      }
    }

    cli.action.start(`Get all issues updated since ${lastIssue.fields[userConfig.destination.fields.syncSourceUpdatedAt]} from the source Jira`);
    const issuesToUpdate = await fetchJqlPagination(
      userConfig.source,
      'project = "' + userConfig.source.projectKey + '" ORDER BY updated DESC',
      '*navigable,comment',
      lastIssue,
      0,
      userConfig.source.fetch.maxNodes,
      [],
    );
    cli.action.stop(`done`)

    this.log(`The following Jira issues will be pushed to the destination instance:`)
    for (const i of issuesToUpdate) {
      this.log(`Needs update - Key: ${i.key} - Updated on: ${i.fields.updated} - Created on: ${i.fields.created}`)
    }

    // Before pushing an update we need to make sure all issues on the source are also present on the destination
    // Including any potential gaps in numbering
    // The last issue by Key might very well be different than last updated issue, thus using a different query
    const lastSourceIssueByKey = await getLastIssueByKey(userConfig.source)
    const lastDesintationIssueByKey = await getLastIssueByKey(userConfig.destination)
    let dstKeyId = 0;
    if (lastDesintationIssueByKey === null) {
      this.log(`The destination server does not contain any issue yet`)      
    } else {
      this.log(`The latest issue created on the destination was: ${lastDesintationIssueByKey.key}, created on: ${lastDesintationIssueByKey.fields.created}`)
      dstKeyId = parseInt(lastDesintationIssueByKey.key.replace(`${userConfig.destination.projectKey}-`, ''))
    }
    this.log(`The latest issue created on the source was: ${lastSourceIssueByKey.key}, created on: ${lastSourceIssueByKey.fields.created}`)

    cli.action.start(`Checking if empty issues needs to be created`);
    const srcKeyId = parseInt(lastSourceIssueByKey.key.replace(`${userConfig.source.projectKey}-`, ''))
    while(dstKeyId < srcKeyId) {
      dstKeyId++;
      this.log(`Creating issue for: ${userConfig.source.projectKey}-${srcKeyId}`)
      await createEmptyIssue(userConfig.destination, `${userConfig.source.projectKey}-${srcKeyId}`)
    }
    cli.action.stop(`done`)

    if (issuesToUpdate.length === 0) {
      this.log(`No issues require an update, exiting`)
      this.exit()
    } 

    cli.action.start(`Grab issues status from the recently updated issues`);
    const destinationIssues = await fetchJqlPagination(
      userConfig.destination,
      `key in(${issuesToUpdate.map((i) => i.key).toString()})`,
      '*navigable,comment',
      null,
      0,
      userConfig.source.fetch.maxNodes,
      [],
    );
    cli.action.stop(`done`)

    cli.action.start(`Updating issues status when necessary`);
    await batchUpdateStatus(userConfig, issuesToUpdate, destinationIssues, this.log)
    cli.action.stop(`done`)

    cli.action.start(`Bulk updating issues content`);
    await batchUpdateIssues(userConfig, issuesToUpdate, this.log)
    cli.action.stop(`done`)    
  }
}
