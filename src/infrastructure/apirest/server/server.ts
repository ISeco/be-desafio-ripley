import cors from "cors";
import Router from "../routes";
import express, { Express, Request, Response } from "express";

const server: Express = express();

const prefix = "/api/v1";

server.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

server.use(express.json());

server.get(`${prefix}/live`, (_req: Request, res: Response) => {
  res.status(200).send({ message: "Server is live" });
});

server.use(prefix, Router);

export default server;