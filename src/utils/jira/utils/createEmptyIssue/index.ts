import axios from 'axios';

import { JiraInstance, JiraInstanceDestination } from '../../../../global';

import { sleep } from '../../../utils';

const createEmptyIssue = async (jiraServer: JiraInstance & JiraInstanceDestination, sourceKey: string) => {
  const issueDataFields: any = {
    project: {
      key: jiraServer.projectKey
    },
    summary: `[${sourceKey}] - Empty issue (for sync purposes)`,

    issuetype: {
      name: jiraServer.defaultIssueType
    },
  }
  if (jiraServer !== undefined) {
    let response: any = {}
    try {
      response = await axios({
        method: 'post',
        url: jiraServer.host + '/rest/api/2/issue',
        auth: {
          username: jiraServer.username,
          password: jiraServer.password,
        },
        data: {
          fields: issueDataFields,
        }
      });
    } catch (error: any) {
      console.log(error.response.data.errors)
      console.log('There has been an error')
    }    
    if (response.data.length > 0) {
      return response.data;
    }
    // Sleep between create requests to avoid flooding the server
    await sleep(50)    
  }
  return [];
};

export default createEmptyIssue;
