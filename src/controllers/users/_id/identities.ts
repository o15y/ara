import {
  RESOURCE_DELETED,
  RESOURCE_SUCCESS,
  respond,
  RESOURCE_CREATED,
} from "@staart/messages";
import {
  ClassMiddleware,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Request,
  Response,
} from "@staart/server";
import { Joi, joiValidate } from "@staart/validate";
import { authHandler } from "../../../_staart/helpers/middleware";
import { userUsernameToId } from "../../../_staart/helpers/utils";
import {
  connectUserIdentityForUser,
  createUserIdentityForUser,
  deleteIdentityForUser,
  getUserIdentitiesForUser,
  getUserIdentityForUser,
} from "../../../_staart/rest/user";

@ClassMiddleware(authHandler)
export class UserIdentitiesController {
  @Get()
  async getUserIdentities(req: Request, res: Response) {
    const id = await userUsernameToId(req.params.id, res.locals.token.id);
    joiValidate({ id: Joi.string().required() }, { id });
    return getUserIdentitiesForUser(res.locals.token.id, id, req.query);
  }

  @Put()
  async createUserIdentity(req: Request, res: Response) {
    const id = await userUsernameToId(req.params.id, res.locals.token.id);
    joiValidate({ id: Joi.string().required() }, { id });
    const added = await createUserIdentityForUser(
      res.locals.token.id,
      id,
      req.body
    );
    return { ...respond(RESOURCE_CREATED), added };
  }

  @Post(":service")
  async connectUserIdentity(req: Request, res: Response) {
    const id = await userUsernameToId(req.params.id, res.locals.token.id);
    joiValidate({ id: Joi.string().required() }, { id });
    const service = req.params.service;
    const url = req.body.url;
    joiValidate(
      { service: Joi.string().required(), url: Joi.string().required() },
      { service, url }
    );
    await connectUserIdentityForUser(res.locals.token.id, id, service, url);
    return respond(RESOURCE_SUCCESS);
  }

  @Get(":identityId")
  async getUserIdentity(req: Request, res: Response) {
    const id = await userUsernameToId(req.params.id, res.locals.token.id);
    const identityId = req.params.identityId;
    joiValidate(
      {
        id: Joi.string().required(),
        identityId: Joi.string().required(),
      },
      { id, identityId }
    );
    return getUserIdentityForUser(res.locals.token.id, id, identityId);
  }

  @Delete(":identityId")
  async deleteUserIdentity(req: Request, res: Response) {
    const id = await userUsernameToId(req.params.id, res.locals.token.id);
    const identityId = req.params.identityId;
    joiValidate(
      {
        id: Joi.string().required(),
        identityId: Joi.string().required(),
      },
      { id, identityId }
    );
    await deleteIdentityForUser(
      res.locals.token.id,
      id,
      identityId,
      res.locals
    );
    return respond(RESOURCE_DELETED);
  }
}
