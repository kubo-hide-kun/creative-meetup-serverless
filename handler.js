"use strict";

const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const logTable = process.env.logTable;
const firstWordTable = process.env.firstWordTable;
const lastWordTable = process.env.lastWordTable;

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

    const { Items: firstWordList } = await dynamoDB
      .scan({ TableName: firstWordTable })
      .promise();
    const { Items: lastWordList } = await dynamoDB
      .scan({ TableName: lastWordTable })
      .promise();

    const firstWord =
      firstWordList[Math.floor(Math.random() * firstWordList.length)].word;
    const lastWord =
      lastWordList[Math.floor(Math.random() * lastWordList.length)].word;

    const word = `${firstWord}をしている${lastWord}`;

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

// デバッグ用API
module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin":
        "https://tango-generator-4-creative-meetup.netlify.app",
    },
    body: JSON.stringify({ message: "hello", event }),
  };
};
