import AWS from "aws-sdk";
/* eslint-disable no-unused-vars */
import { ServiceConfigurationOptions } from "aws-sdk/lib/service";
import {
  Measure,
  DynamoCreate,
  DynamoDelete,
  DynamoUpdate,
  DynamoFetch,
  DynamoScan,
  State,
  StateStatus,
  Section,
  AcsData,
  FmapData,
} from "../types";
/* eslint-enable no-unused-vars */

export function createDbClient() {
  const dynamoConfig: AWS.DynamoDB.DocumentClient.DocumentClientOptions &
    ServiceConfigurationOptions &
    AWS.DynamoDB.ClientApiVersions = {};

  const endpoint = process.env.DYNAMODB_URL;
  if (endpoint) {
    dynamoConfig.endpoint = endpoint;
    dynamoConfig.accessKeyId = "LOCAL_FAKE_KEY"; // pragma: allowlist secret
    dynamoConfig.secretAccessKey = "LOCAL_FAKE_SECRET"; // pragma: allowlist secret
  } else {
    dynamoConfig["region"] = "us-east-1";
  }

  return new AWS.DynamoDB.DocumentClient(dynamoConfig);
}

const client = createDbClient();

export default {
  batchWriteItem: async (params: any) => client.batchWrite(params).promise(),
  get: async <Result = StateStatus | Section | Measure | State>(
    params: DynamoFetch
  ) => {
    const result = await client.get(params).promise();
    return { ...result, Item: result?.Item as Result | undefined };
  },
  put: (params: DynamoCreate) => client.put(params).promise(),
  post: (params: DynamoCreate) => client.put(params).promise(),
  scan: async <
    Result =
      | StateStatus
      | Section
      | Measure
      | State
      | AcsData
      | FmapData
      | State
  >(
    params: DynamoScan
  ) => {
    const result = await client.scan(params).promise();
    return { ...result, Items: result?.Items as Result[] | undefined };
  },
  update: (params: DynamoUpdate) => client.update(params).promise(),
  delete: (params: DynamoDelete) => client.delete(params).promise(),

  // unused
  query: (params: any) => client.query(params).promise(),
};
