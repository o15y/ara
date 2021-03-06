import { success } from "@staart/errors";
import { Controller, Get, Server } from "@staart/server";
import { setupMiddleware } from "@staart/server";
import { init } from "@sentry/node";
init({
  dsn:
    "https://43c314c96f6f40f6a8412cc5857a4bb6@o400462.ingest.sentry.io/5258926",
});

import {
  errorHandler,
  rateLimitHandler,
  speedLimitHandler,
  trackingHandler,
} from "./_staart/helpers/middleware";

@Controller("v1")
class RootController {
  @Get()
  async info() {
    return {
      repository: "https://github.com/staart/api",
      docs: "https://staart.js.org",
      madeBy: ["https://o15y.com", "https://anandchowdhary.com"],
    };
  }
}

export class Staart extends Server {
  constructor() {
    super();
    this.setupHandlers();
    this.addControllers([new RootController()]);
    this.app.use(errorHandler);
  }

  public start(port: number): void {
    this.app.listen(port, () => success(`Listening on ${port}`));
  }

  private setupHandlers() {
    setupMiddleware(this.app);
    this.app.use(trackingHandler);
    this.app.use(rateLimitHandler);
    this.app.use(speedLimitHandler);
  }
}
