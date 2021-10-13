import { flags } from '@oclif/command';
import * as fs from 'fs';
import * as path from 'path';

import cli from 'cli-ux';

import Command from '../base';

import {
  JiraIssue,
  JiraInstance,
} from '../global';

import fetchJqlPagination from '../utils/jira/utils/fetchJql';
import getProject from '../utils/jira/utils/getProject';
import getProjectStatuses from '../utils/jira/utils/getProjectStatuses';

interface IssueAction {
  action: string;
  data: JiraIssue;
}

const getAllIssues = async (cache: boolean, jiraInstance: JiraInstance, configDir: string) => {
  let projectIssues: any = [];
  if (cache === true && fs.existsSync(path.join(configDir, 'cache', 'source-issues.json'))) {
    const file: any = await fs.readFileSync(path.join(configDir, 'cache', 'source-issues.json'));
    projectIssues = JSON.parse(file);
  } else {
    projectIssues = await fetchJqlPagination(
      jiraInstance,
        'project = "' + jiraInstance.projectKey + '" ORDER BY updated DESC',
        '*navigable,comment',
        null,
        0,
        jiraInstance.fetch.maxNodes,
        [],
      );
      fs.writeFileSync(
        path.join(configDir, 'cache', 'source-issues.json'),
        JSON.stringify(projectIssues),
      );        
  }
  return projectIssues;
}

export default class Issues extends Command {
  static description = 'Help prepare the configuration by comparing source and destination Jira projects';

  static flags = {
    help: flags.help({ char: 'h' }),
    envUserConf: flags.string({
      required: false,
      env: 'USER_CONFIG',
      description:
        'User Configuration passed as an environment variable, takes precedence over config file',
    }),
    cache: flags.boolean({
      char: 'c',
      default: false,
      description: 'Use cache data, do not fetch from the source Jira instance (useful for dev)',
    }),      
  };

  async run() {
    const { flags } = this.parse(Issues);

    const userConfig = this.userConfig;

    this.log('---')
    this.log('Step 1: Verifying presence of a destination project')
    cli.action.start(`Step 1: Searching for destination project with key: ${userConfig.destination.projectKey}`);
    const destinationProject = await getProject(userConfig.destination)

    if (destinationProject === null) {
      this.log(`ERROR: Unable to find project with key: ${userConfig.destination.projectKey}`)
      this.exit(1)
    }
    cli.action.stop(`project found: ${destinationProject.name} - description: ${destinationProject.description}`)

    this.log('---')
    this.log('Step 2: Polling all the source issues to get the list of issues statuses and types')
    cli.action.start(`Step 2: Polling issues from source Jira instance`);

    const projectSourceIssues: JiraIssue[] = await getAllIssues(flags.cache, userConfig.source, this.config.configDir);

    const sourceStatuses: string[] = projectSourceIssues.reduce((acc: string[], i) => {
      if (!acc.includes(i.fields.status.name)) {
        acc.push(i.fields.status.name)
      }
      return acc
    }, [])

    const sourceIssuesTypes: string[] = projectSourceIssues.reduce((acc: string[], i) => {
      if (!acc.includes(i.fields.issuetype.name)) {
        acc.push(i.fields.issuetype.name)
      }
      return acc
    }, [])    
    cli.action.stop(`data fetch complete, the following status and types were found:`)
    this.log(`Step 2: Statuses: ${JSON.stringify(sourceStatuses)}`)
    this.log(`Step 2: Types: ${JSON.stringify(sourceIssuesTypes)}`)

    this.log('---')
    this.log('Step 3: Checking the destination server contains the necessary issue types')
    this.log(`Step 3: Source Project: ${JSON.stringify(sourceIssuesTypes)}`)

    const destinationTypes: string[] = destinationProject.issueTypes.reduce((acc: string[], t: any) => {
      if (!acc.includes(t.name)) {
        acc.push(t.name)
      }
      return acc
    }, [])    
    this.log(`Step 3: Destination Project: ${JSON.stringify(destinationTypes)}`)
    this.log(`Step 3: The following mapping are present in configuration:`)
    for (const issueType of userConfig.issueTypes) {
      this.log(`    ${issueType.source} => ${issueType.destination}`)
    }
    const incorrectTypes = userConfig.issueTypes.filter((configType) => {
      return !destinationTypes.includes(configType.destination)
    })
    if (incorrectTypes.length > 0) {
      this.log('ERROR: The following destination types IN YOUR configuration do not exist on the destination project')
      this.log('ERROR: Please create them first or update your configuration')
      this.log(`ERROR: ${JSON.stringify(incorrectTypes)}`)
      this.exit(1)
    }

    const unmappedTypes: string[] = sourceIssuesTypes.filter((sourceType: string) => {
      if (destinationTypes.includes(sourceType)) {
        return false;
      } else if (userConfig.issueTypes.find((configType) => configType.source === sourceType)) {
        return false
      }
      return true
    })
    if (unmappedTypes.length > 0) {
      this.log('ERROR: The following issue types are present in the source Jira Project')
      this.log('ERROR: They do not exist on the destination Jira Project NOR are available through a mapping')
      this.log('ERROR: Please create them first or update your configuration')
      this.log(`ERROR: ${JSON.stringify(unmappedTypes)}`)
      this.exit(1)
    }

    this.log('---')
    this.log('Step 4: Checking the destination server contains the necessary statuses')
    cli.action.start(`Step 4: Polling issues statuses from destination Jira instance`);
    const destinationProjectStatuses = await getProjectStatuses(userConfig.destination)
    cli.action.stop(`done`)

    const destinationStatuses: string[] = destinationProjectStatuses.reduce((acc: string[], t: any) => {
      for (const status of t.statuses) {
        if (!acc.includes(status.name)) {
          acc.push(status.name)
        }        
      }
      return acc
    }, []) 
    this.log(`Step 4: Source Project: ${JSON.stringify(sourceStatuses)}`)
    this.log(`Step 4: Destination Project: ${JSON.stringify(destinationStatuses)}`)
    this.log(`Step 4: The following mapping are present in configuration:`)
    for (const issueStatus of userConfig.status) {
      this.log(`    ${issueStatus.source} => ${issueStatus.destination}`)
    }
    const incorrectStatus = userConfig.status.filter((configStatus) => {
      return !destinationStatuses.includes(configStatus.destination)
    })
    if (incorrectStatus.length > 0) {
      this.log('ERROR: The following destination status IN YOUR configuration do not exist on the destination project')
      this.log('ERROR: Please create them first or update your configuration')
      this.log(`ERROR: ${JSON.stringify(incorrectStatus)}`)
      this.exit(1)
    }

    const unmappedStatuses: string[] = sourceStatuses.filter((sourceStatus: string) => {
      if (destinationStatuses.includes(sourceStatus)) {
        return false;
      } else if (userConfig.status.find((configStatus) => configStatus.source === sourceStatus)) {
        return false
      }
      return true
    })
    if (unmappedStatuses.length > 0) {
      this.log('ERROR: The following issue types are present in the source Jira Project')
      this.log('ERROR: They do not exist on the destination Jira Project NOR are available through a mapping')
      this.log('ERROR: Please create them first or update your configuration')
      this.log(`ERROR: ${JSON.stringify(unmappedStatuses)}`)
      this.exit(1)
    }    

    this.log('=== Prepare step successful, your project should be ready for import ===')
  }
}
