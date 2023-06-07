export async function getJSONFromStream(res: Response) {
  let textData = "";
  const data = res.body!;
  const reader = data.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    textData += decoder.decode(value);
  }
  return JSON.parse(textData.trim());
}
