import { Router } from "express";
import { createUrl, deleteShortUrl, listShortUrl } from "../controllers/urlController.js";
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";
import urlSchema from "../schemas/urlSchema.js";

const urlRouter = Router();

urlRouter.post('/urls/shorten', validateTokenMiddleware, validateSchemaMiddleware(urlSchema), createUrl)
urlRouter.get('/urls/shorten/:shortUrl', listShortUrl)
urlRouter.delete('/urls/:shortId', validateTokenMiddleware, deleteShortUrl)

export default urlRouter