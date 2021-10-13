export interface JiraInstance {
  host: string;
  username: string;
  password: string;
  projectKey: string;
  fetch: {
    maxNodes: number;
  }
}

export interface JiraInstanceDestination {
  defaultIssueType: string;
  fields: {
    syncSourceUpdatedAt: string;
  }
}

export interface JiraMap {
  source: string;
  destination: string;
}

export interface Config {
  source: JiraInstance;
  destination: JiraInstance & JiraInstanceDestination;
  status: JiraMap[];
  fields: JiraMap[];
  issueTypes: JiraMap[];
}

export default Config;
