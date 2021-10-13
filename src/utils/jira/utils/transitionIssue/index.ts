import axios from 'axios';

import { JiraInstance, JiraTransition } from '../../../../global';

import { sleep } from '../../../utils';

const transitionIssue = async (jiraServer: JiraInstance, issueKey: string, transition: JiraTransition) => {
  if (jiraServer !== undefined) {
    let response: any = {}
    try {
      response = await axios({
        method: 'post',
        url: `${jiraServer.host}/rest/api/2/issue/${issueKey}/transitions`,
        auth: {
          username: jiraServer.username,
          password: jiraServer.password,
        },
        data: {
          transition: {
            id: transition.id
          }
        }
      });
    } catch (error: any) {
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

export default transitionIssue;
