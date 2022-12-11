import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "ImplementAppSyncByLocal",
  frameworkVersion: "3", // 3へ変更されていました
  plugins: [
    "serverless-esbuild", // webpackからesbuildへ変更
    "serverless-appsync-simulator",
    "serverless-appsync-plugin",
    "serverless-dynamodb-local", // DynamoDBへの接続のために追加
    "serverless-offline",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    stage: "local", // 今回はローカル環境のため固定値にしています
    region: "ap-northeast-1",
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    "appsync-simulator": {
      location: ".esbuild/.build", // webpackからの変更に伴って修正しています
      apiKey: "da2-fakeApiId123456",
      watch: false,
    },
    dynamodb: {
      stages: ["local"],
      start: {
        docker: true, // 書かなくてもDockerのDynamoDBになりますが、READMEに記載があったため
        port: "8000",
        inMemory: true,
        migrate: true,
        seed: true,
        convertEmptyValues: true,
        noStart: true, // これがないとpluginを起動してDocker接続しない
      },
      seed: {
        local: {
          sources: [
            { table: "Parent", sources: ["migrations/parent.json"] },
            { table: "Child", sources: ["migrations/child.json"] },
          ],
        },
      },
    },
    appSync: {
      name: "appsync-sample",
      authenticationType: "API_KEY",
      schema: "./graphql/schema.graphql",
      apiKeys: [
        {
          name: "test-api-key",
          description: "AppSync test",
          expiresAfter: "30d",
        },
      ],
      dataSources: [
        {
          type: "AMAZON_DYNAMODB",
          name: "dataSourceParent",
          config: {
            tableName: { Ref: "Parent" },
            serviceRoleArn: {
              Fn: ":GetAtt: [AppSyncDynamoDBServiceRole, Arn]",
            },
          },
        },
        {
          type: "AMAZON_DYNAMODB",
          name: "dataSourceChild",
          config: {
            tableName: { Ref: "Child" },
            serviceRoleArn: {
              Fn: ":GetAtt: [AppSyncDynamoDBServiceRole, Arn]",
            },
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      Parent: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "Parent",
          AttributeDefinitions: [
            { AttributeName: "parentId", AttributeType: "S" },
          ],
          KeySchema: [{ AttributeName: "parentId", KeyType: "HASH" }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
      Child: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "Child",
          AttributeDefinitions: [
            { AttributeName: "childId", AttributeType: "S" },
          ],
          KeySchema: [{ AttributeName: "childId", KeyType: "HASH" }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
