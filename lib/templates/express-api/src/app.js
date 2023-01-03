import express from "express";

const app = express();

app.get("/", (req, res) => {
  console.log("sending 'Hello'");

  const message = {
    success: true,
    message: `Hello. Your user agent is: ${req.header("User-Agent")}`,
  };

  res.json(message);
});

export {app};
