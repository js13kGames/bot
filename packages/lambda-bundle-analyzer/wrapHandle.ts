import type { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { serializeError } from "serialize-error";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST",
};
export const wrapHandle =
  (
    handle: (e: APIGatewayProxyEvent) => Promise<any> | any
  ): APIGatewayProxyHandler =>
  async (e) => {
    try {
      return {
        statusCode: 200,
        headers: { ...cors, "content-type": "application/json" },
        body: JSON.stringify(await handle(e)),
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        headers: { ...cors, "content-type": "application/json" },
        body: JSON.stringify(serializeError(error)),
      };
    }
  };
