import { LightningElement, wire } from 'lwc';
import { gql, graphql, refreshGraphQL } from 'lightning/uiGraphQLApi';
import Id from "@salesforce/user/Id";

export default class CaseCustomList extends LightningElement {
    userId = Id;
    cases;
    isLoading = true;

    @wire(graphql, {
      query: gql`
        query getCases($ownerId: ID, $limit: Int = 5) {
            uiapi {
                query {
                    Case(
                        where: { OwnerId: { eq: $ownerId } }
                        first: $limit
                        orderBy: { Priority: { order: ASC } }
                    ) {
                        edges {
                            node {
                                Id
                                Subject { value }
                                Description { value }
                                Priority { value }
                                CreatedDate { value }
                                Status { value }
                            }
                        }
                    }
                }
            }
        }
      `,
      variables: "$params",
    })
    graphqlQueryResult({ data, errors }) {
      this.isLoading = false;
      if (data) {
        this.cases = data.uiapi.query.Case.edges.map((edge) => edge.node);
      }
    }

    get params() {
        return {
            ownerId: this.userId ? this.userId : ''
        };
    }

    async refresh() {
        this.isLoading = true;
        try {
            await refreshGraphQL(this.graphqlQueryResult);
        } catch (e) {
            this.errors = e;
        } finally {
            this.isLoading = false;
        }
    }

}