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
        "Access-Control-Allow-Origin": "*",
      },
      body: "Error: Cannot get word without 'username'",
    };
  }

  try {
    const id = String(Date.now());
    const { Items } = await dynamoDB.scan({ TableName: wordTable }).promise();
    const word = Items[Math.floor(Math.random() * Items.length)].word;
    const createdAt = String(new Date());

    await dynamoDB
      .put({
        TableName: logTable,
        Item: { id, username, word, createdAt },
      })
      .promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ word }),
    };
  } catch (error) {
    const { statusCode, message } = error;
    return {
      statusCode,
      headers: {
        "Access-Control-Allow-Origin": "*",
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
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "hello", event }),
  };
};
