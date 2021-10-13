
import { JiraIssue } from '../../../../global';

import getIssueTransitions from '../getIssueTransitions';
import transitionIssue from '../transitionIssue';
import { Config, JiraTransition } from '../../../../global';

const batchUpdateStatus = async (userConfig: Config, issuesToPush: any[], destinationIssues: any[], logger: any) => {
  const availableTransitions: any = [];
  for (const sourceIssue of issuesToPush) {
    const destinationIssue = destinationIssues.find((i: JiraIssue) => i.key.replace(userConfig.destination.projectKey, '') === sourceIssue.key.replace(userConfig.source.projectKey, ''))
    // Handle issue status change
    //https://docs.atlassian.com/software/jira/docs/api/REST/7.6.1/#api/2/issue-getTransitions
    if (destinationIssue.fields.status.name !== sourceIssue.fields.status.name) {
      logger(`Issue status needs to be updated for ${sourceIssue.key}, source: ${sourceIssue.fields.status.name} - destination: ${destinationIssue.fields.status.name}`)
      let srcTransition = availableTransitions.find((t: JiraTransition) => t.name === sourceIssue.fields.status.name);
      let dstTransition: JiraTransition | null = srcTransition !== undefined ? srcTransition : {};
      if (dstTransition !== null) {
      // If the transition couldn't be found in the list of available transition from the array initially fetched
      // It's possible it's coming from another transition not available then, so we're fetching the list again
      const transitions = await getIssueTransitions(userConfig.destination, destinationIssue.key)        
      for (const t of transitions) {
          if (!availableTransitions.find((at: JiraTransition) => at.name === t.name)) {
          availableTransitions.push({id: t.id, name: t.name})
          }
      }
      srcTransition = availableTransitions.find((t: JiraTransition) => t.name === sourceIssue.fields.status.name);
      if (srcTransition !== undefined) {
          dstTransition = srcTransition
      }
      }
      if (dstTransition !== null) {
        logger(`Submitting transition for update: ${JSON.stringify(dstTransition)}`)
        await transitionIssue(userConfig.destination, destinationIssue.key, dstTransition)
      } else {
        logger(`ERROR: Unable to find transition: ${sourceIssue.fields.status.name}`)
        logger(availableTransitions)
      }  
    } else {
      logger(`Issue update not needed for ${destinationIssue.key}, source: ${sourceIssue.fields.status.name} - destination: ${destinationIssue.fields.status.name}`)
    }
  }
};

export default batchUpdateStatus;
