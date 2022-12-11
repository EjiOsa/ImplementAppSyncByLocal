import "source-map-support/register";

import { AppSyncResolverHandler } from "aws-lambda";

export const responseOK: AppSyncResolverHandler<any, any> = async (event) => {
  console.log("event", event);

  return "OK";
};