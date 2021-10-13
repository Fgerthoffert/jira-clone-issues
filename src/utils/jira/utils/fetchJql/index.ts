import axios from 'axios';
import { performance } from 'perf_hooks';

import { JiraIssue, JiraInstance } from '../../../../global';

export const fetchJql = async (
  jiraServer: JiraInstance,
  jqlQuey: string,
  fields: string,
  startAt: number,
  maxResults: number,
) => {
  if (jiraServer !== undefined) {
    const response = await axios({
      method: 'get',
      url: jiraServer.host + '/rest/api/2/search',
      auth: {
        username: jiraServer.username,
        password: jiraServer.password,
      },
      validateStatus: function(status) {
        return status >= 200 && status < 500;
      },
      params: {
        jql: jqlQuey,
        startAt: startAt,
        maxResults: maxResults,
        fields: fields,
      },
    });
    // console.log(jqlQuey);
    // console.log(response.data);
    if (response.data !== undefined) {
      return response.data;
    }
  }
  return {};
};

const fetchJqlPagination = async (
  jiraServer: JiraInstance,
  jqlQuey: string,
  fields: string,
  issue: JiraIssue | null,
  startAt: number,
  maxResults: number,
  issues: Array<JiraIssue>,
) => {
  console.log(
    '    Start: startAt: ' +
      startAt +
      ' - maxResults: ' +
      maxResults +
      ' - issues in current cache: ' +
      issues.length,
  );
  const t0 = performance.now();
  const response = await fetchJql(
    jiraServer,
    jqlQuey,
    fields,
    startAt,
    maxResults,
  );
  const t1 = performance.now();
  const callDuration = t1 - t0;
  let addedToCache = 0;

  if (response.errorMessages !== undefined) {
    console.log(response);
    return [];
  }

  if (issue === null) {
    for (const newIssue of response.issues) {
      issues.push(newIssue);
    }
    addedToCache = response.issues.length;
  } else {
    addedToCache = 0;
    for (const newIssue of response.issues) {
      if (
        new Date(newIssue.fields.updated) < new Date(issue.fields.updated) || 
        (new Date(newIssue.fields.updated).toISOString() === new Date(issue.fields.updated).toISOString() && newIssue.key === issue.key)) {
        break;
      } else {
        issues.push(newIssue);
        addedToCache++;
      }
    }
  }
  const apiPerf = Math.round(response.issues.length / (callDuration / 1000));
  console.log(
    '    Fetched: ' +
      response.issues.length +
      ' issues - Total: ' +
      response.total +
      ' - issues in current cache: ' +
      issues.length +
      ', download rate: ' +
      apiPerf +
      ' nodes/s',
  );
  if (
    addedToCache !== response.issues.length ||
    issues.length === response.total
  ) {
    console.log('    Issue already in cache and/or dataset up to date, stopping');
  } else {
    await fetchJqlPagination(
      jiraServer,
      jqlQuey,
      fields,
      issue,
      issues.length,
      maxResults,
      issues,
    );
  }
  return issues;
};

export default fetchJqlPagination;
