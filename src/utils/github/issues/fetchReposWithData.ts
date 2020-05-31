const query = `
  query($data_array: [ID!]!) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    nodes(ids: $data_array) {
      ... on Repository {
        id
        issues(first: 1) {
          totalCount
        }        
      }            
    }
  }
`;
export default query;
