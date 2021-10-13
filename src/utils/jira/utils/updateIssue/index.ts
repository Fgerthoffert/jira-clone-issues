import axios from 'axios';

import { JiraInstance, JiraIssue } from '../../../../global';

import { sleep } from '../../../utils';

const updateIssue = async (jiraServer: JiraInstance, issue: JiraIssue) => {
  if (jiraServer !== undefined) {
    let response: any = {}
    try {
      response = await axios({
        method: 'put',
        url: `${jiraServer.host}/rest/api/2/issue/${issue.key}`,
        auth: {
          username: jiraServer.username,
          password: jiraServer.password,
        },
        data: issue
      });
    } catch (error: any) {
      console.log(issue)
      console.log(error.response.data.errors)
      console.log('There has been an error')
    }
    if (response.data.length > 0) {
      return response.data;
    }
    // Sleep for 50ms between create requests to avoid flooding the server
    await sleep(50)    
  }
  return [];
};

export default updateIssue;
