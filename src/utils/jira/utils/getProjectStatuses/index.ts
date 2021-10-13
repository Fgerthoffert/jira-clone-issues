import axios from 'axios';

import { JiraInstance } from '../../../../global';

import { sleep } from '../../../utils';

const getProjectStatuses = async (jiraServer: JiraInstance) => {
  if (jiraServer !== undefined) {
    let response: any = {}
    try {
      response = await axios({
        method: 'get',
        url: `${jiraServer.host}/rest/api/2/project/${jiraServer.projectKey}/statuses`,
        auth: {
          username: jiraServer.username,
          password: jiraServer.password,
        }
      });
    } catch (error: any) {
      console.log(error)
      console.log(error.response.data.errors)
      console.log('There has been an error')
    }
    if (Object.keys(response.data).length > 0) {
      return response.data;
    }
    // Sleep for 50ms between create requests to avoid flooding the server
    await sleep(50)    
  }
  return null;
};

export default getProjectStatuses;
