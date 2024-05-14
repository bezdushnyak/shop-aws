const generatePolicy = (principalId, effect, resource) => ({
  principalId,
  policyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: resource,
      },
    ],
  },
});

const generateAllow = (principalId, resource) =>
  generatePolicy(principalId, "Allow", resource);

const generateDeny = (principalId, resource) =>
  generatePolicy(principalId, "Deny", resource);

const isAuthHeaderValid = (authHeader) => {
  const [_tokenType, token] = authHeader.split(" ");

  return (
    token ===
    Buffer.from(
      `${process.env.USER_LOGIN}:${process.env.USER_PASSWORD}`,
      "utf8"
    ).toString("base64")
  );
};

module.exports.authorizer = (event, _context, callback) => {
  const {
    headers: { Authorization: authHeader },
    methodArn,
  } = event;

  if (!authHeader) {
    callback("Unauthorized");
    return;
  }

  if (!isAuthHeaderValid(authHeader)) {
    callback(null, generateDeny(process.env.PRINCIPAL_ID, methodArn));
    return;
  }

  callback(null, generateAllow(process.env.PRINCIPAL_ID, methodArn));
};
