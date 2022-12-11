import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "ImplementAppSyncByLocal",
  frameworkVersion: "3", // 3へ変更されていました
  plugins: [
    "serverless-esbuild",　// webpackからesbuildへ変更
    "serverless-appsync-simulator",
    "serverless-appsync-plugin",
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
  functions: {
    sampleFunction: {
      handler: "src/handler.responseOK",
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
      defaultMappingTemplates: {
        request: false,
        response: false,
      },
      mappingTemplates: [
        {
          dataSource: "dataSourcesLambda",
          type: "Query",
          field: "getOK",
        },
      ],
      dataSources: [
        {
          type: "AWS_LAMBDA",
          name: "dataSourcesLambda",
          config: {
            functionName: "sampleFunction",
          },
        },
        
      ],
    },
  },
};

module.exports = serverlessConfiguration;