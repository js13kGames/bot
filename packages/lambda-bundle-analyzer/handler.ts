import { APIGatewayProxyHandler } from "aws-lambda";
// import { analyze } from "js13kGames-bot-bundle-analyzer/analyze";

export const handle: APIGatewayProxyHandler = async (event) => {
  // const report = await analyze();

  console.log(event.body);

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: 1 }),
  };
};
