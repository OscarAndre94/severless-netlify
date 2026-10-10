import type { Config, Context } from "@netlify/edge-functions";

export default async (req: Request, context: Context) => {
  const codigo = context.geo.country?.code;

  const pais = codigo
    ? (new Intl.DisplayNames(["es"], { type: "region" }).of(codigo) ?? codigo)
    : "un lugar desconocido";

  const body = {
    function: "GitHub Webhooks a Discord",
    status: "activo",
    message: `Hola, visitante desde ${pais}`,
    
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const config: Config = {
  path: "/salute",
};
