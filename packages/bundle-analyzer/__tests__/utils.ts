/**
 * redact some value that are bound to the env
 * in order to have a report without ties to the env
 */
export const redact = (o: any) =>
  JSON.parse(
    JSON.stringify(o).replace(urlRegExp, (url) => {
      if (url.includes(process.env.SUBMISSION_BUCKET_NAME!))
        return redactOrigin(url);
      else return url;
    })
  );

const redactOrigin = (url: string) => {
  const u = new URL(url);
  u.host = "example.com";
  return u.toString().replace("example.com", "<deploy-url>");
};

const urlRegExp = /https?:\/\/[\w\/\.\?\#\-]*/g;
