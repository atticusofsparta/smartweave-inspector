export const deployedContractQuery = (
  address: string,
  cursor?: string,
) => {
  const queryObject = {
    query: `
  { 
    transactions (
      owners: ["${address}"],
      tags: [
        {
          name: "App-Name",
          values: ["SmartWeaveContract"]
        }
      ],
      sort: HEIGHT_DESC,
      first: 100
    ) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          block {
            height
          }
        }
      }
    }
  }`,
  };
  return queryObject;
};


export const recentContractDeploys = () => {
  const queryObject = {
    query: `
  { 
    transactions (
      tags: [
        {
          name: "App-Name",
          values: ["SmartWeaveContract"]
        }
      ],
      sort: HEIGHT_ASC,
      first: 100
    ) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          block {
            height
          }
        }
      }
    }
  }`,
  };
  return queryObject;
};
