import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function parseJsonResponse(response: any, fallback?: any) {
  const responseString = response.data.choices[0].message?.content!;

  console.log(responseString);

  let cleanedResponse = responseString
    .replace(/^[^{]*{/, "{")
    .replace(/}[^}]*$/, "}");

  let val;
  try {
    val = JSON.parse(cleanedResponse);
  } catch (e) {
    console.log(e);
    val = fallback;
  }

  return val;
}

export async function generateRoot(description: string) {
  const system = `
        You are a helpful assistant for a React developer.
        You are given a description, and you generate a React component tree (in JSX, using Tailwind CSS)
        that fulfills the description along with a list of the names of new components (dependencies) needed for your component tree (if any).
        You present it to the developer in the JSON format described here:

        \`\`\`
        {
            "dependencies": ["...", "..."],
            "jsx": "...",
        }
        \`\`\`
  `;

  const initialPrompt = `
        Generate a React component tree (in JSX, using Tailwind CSS) that fulfills this description:

        ${description}

        First, come up with the names for the components you'd need to implement to satisfy this description. 
        This should include components that describe semantic sections of the output, as well as components that represent sepcific UI elements.
        Output this list of names in the "dependencies" key of the output JSON. The "dependencies" list should ONLY include component names, not any other functions or libraries.
        Then, using only these components and standard HTML elements, generate a React component tree (in JSX, using Tailwind CSS) that fulfills the description. Only provide the JSX for the top-level component, in the "jsx" key of the output JSON.
        Provide output in this JSON format: 

        \`\`\`
        {
            "dependencies": ["...", "..."],
            "jsx": "...",
        }
        \`\`\`

        Make sure to respond only with JSON and no other content or text. Do not have any text before or after the JSON. Do not output any explanation. `;

  const folloupPrompt = (comp: string) => `
        Please use the same output format and rules as before to generate the JSX for the '${comp}' component that you described above. 
        Remember to include the names of any new components you need to implement in the "dependencies" key of the output JSON. No other dependencies should be included in the "dependencies" key. 
        Make sure the output is styled with Tailwind CSS to look modern and responsive. 

        Provide output in this JSON format: 

        \`\`\`
        {
            "dependencies": ["...", "..."],
            "jsx": "...",
        }
        \`\`\`
  `;

  let messages: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: system,
    },
    {
      role: "user",
      content: initialPrompt,
    },
  ];

  let rawResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages,
  });

  messages.push(rawResponse.data.choices[0].message!);
  let response = parseJsonResponse(rawResponse);

  let files: { [name: string]: string } = {};
  files["index"] = response.jsx;

  let allDependencies = new Set(response.dependencies);
  let dependencyQueue: string[] = response.dependencies.slice();

  while (dependencyQueue.length > 0) {
    const curr = dependencyQueue.shift()!;
    messages.push({
      role: "user",
      content: folloupPrompt(curr),
    });
    rawResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
    });
    messages.push(rawResponse.data.choices[0].message!);
    response = parseJsonResponse(rawResponse, {
      dependencies: [],
      jsx: "",
    });
    files[curr] = response.jsx;
    for (const dep of response.dependencies) {
      if (!allDependencies.has(dep)) {
        allDependencies.add(dep);
        dependencyQueue.push(dep);
      }
    }
  }

  console.log(files);
  return files;
}

export async function modifyComponent(old: string, modification: string) {
  const system = `
        You are a helpful assistant for a React developer.
        You are given a React component tree (in JSX, using Tailwind CSS) and a description of a modification to make. 
        You make the modification, explain the changes you made and return a new JSX component tree.
        
        You respond with JSON of the form:
        \`\`\`
        {
            "explanation": "...",
            "jsx": "..."
        }
        \`\`\`
        
        Where the value of \`jsx\` is the new JSX component tree (still using Tailwind for styling) and nothing else, 
        and the value of \`explanation\` is a description of the changes you made and why you made them.

        Only respond with the JSON, and no other text content. 
        
        Be very thorough in your explanation, and make sure to explain the changes you made.`;
  const prompt = `
        Modify this React component tree (in JSX, styled with Tailwind CSS): 

        \`\`\`
        ${old}
        \`\`\`

        To satisfy this modification:

        ${modification}
        
        Do not assume that any custom components exist that aren't already used; use only standard HTML elements in your changes. Make sure to respond only with JSON and no other content or text. Do not output the explanation outside of the JSON. Do not have any text before or after the JSON. `;
  const rawResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const responseString = rawResponse.data.choices[0].message?.content!;

  console.log(responseString);
  const cleanedResponse = responseString
    .replace(/^[^{]*{/, "{")
    .replace(/}[^}]*$/, "}");

  const response = JSON.parse(cleanedResponse);

  return response;
}
