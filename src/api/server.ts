import Fastify from "fastify";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ status: "ok" }));

app.post("/api/chat", async (request) => ({
  type: "message",
  message: "Backend inicializado. El ciclo del agente se implementará sobre las tools tipadas."
}));

app.listen({ port: Number(process.env.PORT ?? 3000), host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
