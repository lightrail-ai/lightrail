export async function createDatabase(name: string) {
  const result = await fetch(process.env.NEON_DATABASES_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEON_API_KEY}`,
      Accept: "application/json",
    },
    body: JSON.stringify({
      database: {
        name,
        owner_name: process.env.NEON_DEFAULT_ROLE,
      },
    }),
  });
  const json = await result.json();
  console.log(json);
  return json["database"];
}
