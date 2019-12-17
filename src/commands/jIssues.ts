import { flags } from '@oclif/command';
import { ApiResponse } from '@elastic/elasticsearch';

import cli from 'cli-ux';
import * as jsYaml from 'js-yaml';

import Command from '../base';
import esClient from '../utils/es/esClient';
import chunkArray from '../utils/misc/chunkArray';
import { getId } from '../utils/misc/getId';

import YmlIssues from '../schemas/jiraIssues';
import YmlSettings from '../schemas/settings';

import {
  ESIndexSources,
  ESSearchResponse,
  ConfigJira,
  JiraIssue,
} from '../global';
import esGetActiveSources from '../utils/es/esGetActiveSources';

import fetchJqlPagination from '../utils/jira/fetchJql';

export default class JIssues extends Command {
  static description = 'Jira: Fetches issues data from configured projects';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    const userConfig = this.userConfig;
    const client = await esClient(userConfig.elasticsearch);
    // Split the array by jira server
    for (const jiraServer of userConfig.jira.filter(
      (p: ConfigJira) => p.enabled === true,
    )) {
      const sources = await esGetActiveSources(client, userConfig);
      if (sources.length === 0) {
        this.error(
          'The script could not find any active sources. Please configure sources first.',
          { exit: 1 },
        );
      }
      for (const source of sources.filter(
        (s: ESIndexSources) => s.server === jiraServer.name,
      )) {
        // Defines index name, one index per projet and per server
        const issuesIndex = (
          userConfig.elasticsearch.indices.jiraIssues +
          getId(jiraServer.name) +
          '_' +
          source.id
        ).toLocaleLowerCase();

        // Test if the index exists, create if it does not
        const testIndex = await client.indices.exists({ index: issuesIndex });
        if (testIndex.body === false) {
          cli.action.start(
            'Elasticsearch Index ' + issuesIndex + ' does not exist, creating',
          );
          const mappings = await jsYaml.safeLoad(YmlIssues);
          const settings = await jsYaml.safeLoad(YmlSettings);
          await client.indices.create({
            index: issuesIndex,
            body: { settings, mappings },
          });
          cli.action.stop(' created');
        }

        //B - Find the most recent issue
        const searchResult: ApiResponse<ESSearchResponse<
          JiraIssue
        >> = await client.search({
          index: issuesIndex,
          body: {
            query: {
              match_all: {}, // eslint-disable-line
            },
            size: 1,
            sort: [
              {
                'fields.updated': {
                  order: 'desc',
                },
              },
            ],
          },
        });
        let recentIssue = null;
        if (searchResult.body.hits.hits.length > 0) {
          recentIssue = searchResult.body.hits.hits[0]._source;
        }

        cli.action.start('Fetching issues for project: ' + source.name);
        const propjectIssues = await fetchJqlPagination(
          userConfig,
          source.server,
          'project = "' + source.id + '" ORDER BY updated DESC',
          '',
          recentIssue,
          0,
          jiraServer.config.fetch.maxNodes,
          [],
        );
        cli.action.stop(' done');

        console.log(propjectIssues.length);
        //Break down the issues response in multiple batches
        const esPayloadChunked = await chunkArray(propjectIssues, 100);
        //Push the results back to Elastic Search
        for (const [idx, esPayloadChunk] of esPayloadChunked.entries()) {
          cli.action.start(
            'Submitting data to ElasticSearch into ' +
              issuesIndex +
              ' (' +
              (idx + 1) +
              ' / ' +
              esPayloadChunked.length +
              ')',
          );
          let formattedData = '';
          for (const rec of esPayloadChunk) {
            formattedData =
              formattedData +
              JSON.stringify({
                index: {
                  _index: issuesIndex,
                  _id: (rec as JiraIssue).id,
                },
              }) +
              '\n' +
              JSON.stringify(rec) +
              '\n';
          }
          await client.bulk({
            index: issuesIndex,
            refresh: 'wait_for',
            body: formattedData,
          });
          cli.action.stop(' done');
        }
      }
    }
  }
}