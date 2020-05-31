import Command from '@oclif/command';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as jsYaml from 'js-yaml';
import * as loadYamlFile from 'load-yaml-file';
import * as path from 'path';

import { Config } from './global';

export default abstract class extends Command {
  userConfig = {
    elasticsearch: {
      host: 'http://127.0.0.1:9200',
      sslCa: '',
      cloudId: '',
      username: '',
      password: '',
      sysIndices: {
        sources: 'sources', // this index is used to store sources data
        datasets: 'datasets', // this index is used to store data about available index types
        config: 'config', // this index is used to store zencrepes configuration
      },
      oneIndexPerSource: false,
      dataIndices: {
        githubRepos: 'gh_repos',
        githubIssues: 'gh_issues_',
        githubPullrequests: 'gh_prs_',
        githubVulnerabilities: 'gh_vulns_',
        githubStargazers: 'gh_stargazers_watchers_',
        githubWatchers: 'gh_stargazers_watchers_',
        githubProjects: 'gh_projects_',
        githubMilestones: 'gh_milestones_',
        githubLabels: 'gh_labels_',
        githubReleases: 'gh_releases_',
        jiraIssues: 'j_issues_',
        jiraProjects: 'j_projects_',
        circleciPipelines: 'cci_pipelines_',
        circleciEnvvars: 'cci_envvars_',
        circleciInsights: 'cci_insights_',
      },
    },
    github: {
      enabled: true,
      username: 'YOUR_USERNAME',
      token: 'YOUR_TOKEN',
      fetch: {
        maxNodes: 30,
      },
      // Define a match between a points label and numbers
      storyPointsLabels: [
        { label: 'xx-small', points: 1 },
        { label: 'x-small', points: 2 },
        { label: 'small', points: 3 },
        { label: 'medium', points: 5 },
        { label: 'large', points: 8 },
        { label: 'x-large', points: 13 },
      ],
    },
    circleci: {
      enabled: true,
      token: 'YOUR_TOKEN',
    },
    jira: [
      {
        name: 'SERVER_1',
        enabled: true,
        config: {
          username: 'username',
          password: 'password',
          host: 'https://jira.myhost.org',
          fields: {
            issues: [
              { jfield: 'issueType', zfield: 'issueType' },
              { jfield: 'parent', zfield: 'parent' },
              { jfield: 'project', zfield: 'project' },
              { jfield: 'fixVersions', zfield: 'fixVersions' },
              { jfield: 'resolution', zfield: 'resolution' },
              { jfield: 'resolutiondate', zfield: 'closedAt' },
              { jfield: 'watches', zfield: 'watches' },
              { jfield: 'created', zfield: 'createdAt' },
              { jfield: 'priority', zfield: 'priority' },
              { jfield: 'versions', zfield: 'versions' },
              { jfield: 'issuelinks', zfield: 'links' },
              { jfield: 'issuetype', zfield: 'type' },
              { jfield: 'assignee', zfield: 'assignee' },
              { jfield: 'resolution', zfield: 'resolution' },
              { jfield: 'updated', zfield: 'updatedAt' },
              { jfield: 'status', zfield: 'status' },
              { jfield: 'description', zfield: 'description' },
              { jfield: 'summary', zfield: 'summary' },
              { jfield: 'creator', zfield: 'creator' },
              { jfield: 'subtasks', zfield: 'subtasks' },
              { jfield: 'reporter', zfield: 'reporter' },
              { jfield: 'environment', zfield: 'environment' },
              { jfield: 'duedate', zfield: 'dueAt' },
              { jfield: 'customfield_10114', zfield: 'points' },
              {
                jfield: 'customfield_11115',
                zfield: 'originalPoints',
              },
              {
                jfield: 'customfield_11112',
                zfield: 'parentInitiative',
              },
              {
                jfield: 'customfield_10314',
                zfield: 'parentEpic',
              },
            ],
          },
          excludeDays: ['1900-01-01'],
          fetch: {
            maxNodes: 30,
          },
        },
      },
    ],
  };

  setUserConfig(userConfig: Config) {
    this.userConfig = userConfig;
  }

  async init() {
    if (process.env.CONFIG_DIR !== undefined) {
      this.config.configDir = process.env.CONFIG_DIR;
    }
    // If config file does not exists, initialize it:
    fse.ensureDirSync(this.config.configDir);
    fse.ensureDirSync(this.config.configDir + '/cache/');

    if (!fs.existsSync(path.join(this.config.configDir, 'config.yml'))) {
      fs.writeFileSync(
        path.join(this.config.configDir, 'config.yml'),
        jsYaml.safeDump(this.userConfig),
      );
      this.log(
        'Initialized configuration file with defaults in: ' +
          path.join(this.config.configDir, 'config.yml'),
      );
      this.log('Please EDIT the configuration file first');
      this.exit();
    } else {
      this.log(
        'Configuration file exists: ' +
          path.join(this.config.configDir, 'config.yml'),
      );

      const userConfig = await loadYamlFile(
        path.join(this.config.configDir, 'config.yml'),
      );
      this.setUserConfig(userConfig);
      //console.log(this.userConfig);
    }
  }
}
