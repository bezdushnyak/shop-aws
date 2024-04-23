import { PublishCommand } from "@aws-sdk/client-sns";

import snsClient from "@config/snsClient";

class NotifyService {
  async publishProductsSuccessCreateMessage({ message, sumPrice }) {
    const publishCommand = new PublishCommand({
      TopicArn: process.env.AWS_SNS_TOPIC_ARN,
      MessageAttributes: {
        sumPrice: {
          DataType: "Number",
          StringValue: sumPrice.toString(),
        },
      },
      Message: message,
    });
    await snsClient.send(publishCommand);
  }
}

export default NotifyService;
