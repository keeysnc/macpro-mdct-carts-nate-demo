import dynamoLib, { createDbClient } from "../dynamodb-lib";
import { CoreSetAbbr, MeasureStatus } from "../../types";
import AWS from "aws-sdk";

const mockPromiseCall = jest.fn();

jest.mock("aws-sdk", () => ({
  __esModule: true,
  default: {
    DynamoDB: {
      DocumentClient: jest.fn().mockImplementation((_config) => {
        return {
          get: (_x: any) => ({ promise: mockPromiseCall }),
          put: (_x: any) => ({ promise: mockPromiseCall }),
          post: (_x: any) => ({ promise: mockPromiseCall }),
          query: (_x: any) => ({ promise: mockPromiseCall }),
          scan: (_x: any) => ({ promise: mockPromiseCall }),
          update: (_x: any) => ({ promise: mockPromiseCall }),
          delete: (_x: any) => ({ promise: mockPromiseCall }),
        };
      }),
    },
  },
}));

describe("Test DynamoDB Interaction API Build Structure", () => {
  test("API structure should be callable", () => {
    const testKeyTable = {
      Key: { compoundKey: "testKey", coreSet: CoreSetAbbr.ACS },
      TableName: "testTable",
    };
    const testItem = {
      compoundKey: "dynamoKey",
      state: "FL",
      year: 2019,
      coreSet: CoreSetAbbr.ACS,
      measure: "event!.pathParameters!.measure!",
      createdAt: Date.now(),
      lastAltered: Date.now(),
      lastAlteredBy: `event.headers["cognito-identity-id"]`,
      status: MeasureStatus.COMPLETE,
      description: "",
      data: {},
    };
    dynamoLib.query(true);
    dynamoLib.get(testKeyTable);
    dynamoLib.delete(testKeyTable);
    dynamoLib.put({ TableName: "testTable", Item: testItem });
    dynamoLib.scan({
      ...testKeyTable,
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
    });
    dynamoLib.update({
      ...testKeyTable,
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
    });
    dynamoLib.post({
      TableName: "",
      Item: testItem,
    });

    expect(mockPromiseCall).toHaveBeenCalledTimes(7);
  });

  describe("Checking Environment Variable Changes", () => {
    test("Check if statement with DYNAMADB_URL undefined", () => {
      process.env = { ...process.env, DYNAMODB_URL: undefined };
      jest.resetModules();

      createDbClient();
      expect(AWS.DynamoDB.DocumentClient).toHaveBeenCalledWith({
        region: "us-east-1",
      });
    });

    test("Check if statement with DYNAMADB_URL set", () => {
      process.env = { ...process.env, DYNAMODB_URL: "endpoint" };
      jest.resetModules();

      createDbClient();
      expect(AWS.DynamoDB.DocumentClient).toHaveBeenCalledWith({
        endpoint: "endpoint",
        accessKeyId: "LOCAL_FAKE_KEY", // pragma: allowlist secret
        secretAccessKey: "LOCAL_FAKE_SECRET", // pragma: allowlist secret
      });
    });
  });
});
