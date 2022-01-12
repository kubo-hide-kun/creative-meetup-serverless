"use strict";

const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const logTable = process.env.logTable;
const wordTable = process.env.wordTable;

module.exports.getWord = async (event) => {
  const { username } = JSON.parse(event.body);

  if (!username) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin":
          "https://tango-generator-4-creative-meetup.netlify.app",
      },
      body: "Error: Cannot get word without 'username'",
    };
  }

  try {
    const id = String(Date.now());
    const createdAt = String(new Date());

    const [logRes, wordRes] = await Promise.all([
      dynamoDB.scan({ TableName: logTable }).promise(),
      dynamoDB.scan({ TableName: wordTable }).promise(),
    ]);
    const { Items: words } = wordRes;
    const count = logRes.Items.length % words.length;

    const word = words[count].word;

    await dynamoDB
      .put({
        TableName: logTable,
        Item: {
          id,
          username,
          createdAt,
          word,
        },
      })
      .promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin":
          "https://tango-generator-4-creative-meetup.netlify.app",
      },
      body: JSON.stringify({ word }),
    };
  } catch (error) {
    const { statusCode, message } = error;
    return {
      statusCode,
      headers: {
        "Access-Control-Allow-Origin":
          "https://tango-generator-4-creative-meetup.netlify.app",
      },
      body: message,
    };
  }
};

module.exports.getLogAll = async () => {
  try {
    const { Items } = await dynamoDB.scan({ TableName: logTable }).promise();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ Items }),
    };
  } catch (error) {
    const { statusCode, message } = error;
    return {
      statusCode,
      headers: {
        "Access-Control-Allow-Origin":
          "https://tango-generator-4-creative-meetup.netlify.app",
      },
      body: message,
    };
  }
};

// 単語を投稿する。
module.exports.postWords = async () => {
  const words = [];
  const requests = words.map((word) =>
    dynamoDB
      .put({
        TableName: wordTable,
        Item: { word },
      })
      .promise()
  );
  await Promise.all(requests);
};
