const query = `
  query ($repo_cursor: String, $increment: Int) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    viewer {
      organizations(first: $increment, after: $repo_cursor) {
        totalCount
        edges {
          cursor
          node {
            name
            login
            id
            repositories {
              totalCount
            }
          }
        }
      }
    }
  }
`;
export default query;
