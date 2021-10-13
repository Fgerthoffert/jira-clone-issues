export {
  Config,
  JiraInstance,
  JiraInstanceDestination,
  JiraMap,
} from './components/config/defaultConfig.type';

export interface JiraTransition {
  id: string;
  name: string;
}

export interface JiraIssueFields {
  status: {
    name: string;
  };
  issuetype: {
    name: string
  };
  summary: string;
  updated: string;
  created: string;
}

export interface JiraIssue {
  id?: string;
  key: string;
  fields: JiraIssueFields;
}

