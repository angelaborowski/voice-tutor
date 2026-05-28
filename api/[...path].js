import app from "../server/server.mjs";

export default function handler(req, res) {
  return app(req, res);
}
